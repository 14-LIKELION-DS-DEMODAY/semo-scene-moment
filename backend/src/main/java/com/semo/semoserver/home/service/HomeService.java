package com.semo.semoserver.home.service;

import com.semo.semoserver.global.storage.FileStorage;
import com.semo.semoserver.guest.entity.Guest;
import com.semo.semoserver.guest.service.GuestService;
import com.semo.semoserver.home.dto.ContinueOrganizing;
import com.semo.semoserver.home.dto.HomeResponse;
import com.semo.semoserver.home.dto.SemoCard;
import com.semo.semoserver.home.dto.SemoCount;
import com.semo.semoserver.home.dto.SemoPhotoStat;
import com.semo.semoserver.home.dto.SemoSort;
import com.semo.semoserver.home.repository.HomeQueryRepository;
import com.semo.semoserver.participant.entity.Participant;
import com.semo.semoserver.photo.entity.PhotoMatchStatus;
import com.semo.semoserver.semo.entity.Semo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HomeService {

    private static final int HOME_PREVIEW_SIZE = 3;
    private static final List<PhotoMatchStatus> REVIEW_STATUSES =
            List.of(PhotoMatchStatus.NEEDS_REVIEW, PhotoMatchStatus.UNCLASSIFIED);

    private final HomeQueryRepository homeQueryRepository;
    private final GuestService guestService;
    private final FileStorage fileStorage;

    // 카드 + 정렬에 필요한 원본 정보를 같이 들고 다니기 위한 내부 타입
    private record Row(Participant participant, SemoCard card) {
        Semo semo() {
            return participant.getSemo();
        }
    }

    public HomeResponse getHome(Long guestId) {
        Guest guest = guestService.getGuest(guestId);
        List<Row> rows = sort(loadRows(guestId), SemoSort.ACTIVITY);

        List<SemoCard> preview = rows.stream()
                .limit(HOME_PREVIEW_SIZE)
                .map(Row::card)
                .toList();

        // 이어서 보기: 가장 최근에 열어 본 세모 (participant.last_viewed_at, 정은의 타임라인 API가 갱신)
        SemoCard recent = rows.stream()
                .filter(r -> r.participant().getLastViewedAt() != null)
                .max(Comparator.comparing(r -> r.participant().getLastViewedAt()))
                .map(Row::card)
                .orElse(null);

        return new HomeResponse(guest.getDefaultNickname(), findContinueOrganizing(guestId, rows), recent, preview);
    }

    public List<SemoCard> getMySemos(Long guestId, String keyword, SemoSort sort) {
        List<Row> rows = loadRows(guestId);
        if (keyword != null && !keyword.isBlank()) {
            String k = keyword.strip().toLowerCase(Locale.ROOT);
            rows = rows.stream()
                    .filter(r -> r.semo().getName().toLowerCase(Locale.ROOT).contains(k))
                    .toList();
        }
        return sort(rows, sort).stream().map(Row::card).toList();
    }

    // 이어서 정리하기: 내가 올린 사진 중 확인 필요(NEEDS_REVIEW, UNCLASSIFIED)가 남은 세모 중 활동이 가장 최근인 곳
    private ContinueOrganizing findContinueOrganizing(Long guestId, List<Row> rowsByActivity) {
        Map<Long, Long> reviewCounts = homeQueryRepository.countReviewPhotos(guestId, REVIEW_STATUSES).stream()
                .collect(Collectors.toMap(SemoCount::semoId, SemoCount::count));
        return rowsByActivity.stream()   // 이미 활동순이라 첫 번째가 가장 최근
                .filter(r -> reviewCounts.getOrDefault(r.semo().getId(), 0L) > 0)
                .findFirst()
                .map(r -> new ContinueOrganizing(r.semo().getId(), r.semo().getName(),
                        reviewCounts.get(r.semo().getId())))
                .orElse(null);
    }

    private List<Row> loadRows(Long guestId) {
        List<Participant> participations = homeQueryRepository.findMyParticipations(guestId);
        if (participations.isEmpty()) {
            return List.of();
        }
        List<Long> semoIds = participations.stream().map(p -> p.getSemo().getId()).toList();

        Map<Long, SemoPhotoStat> photoStats = homeQueryRepository.findPhotoStats(semoIds).stream()
                .collect(Collectors.toMap(SemoPhotoStat::semoId, Function.identity()));
        Map<Long, Long> participantCounts = homeQueryRepository.countParticipants(semoIds).stream()
                .collect(Collectors.toMap(SemoCount::semoId, SemoCount::count));

        return participations.stream()
                .map(p -> new Row(p, toCard(p, photoStats.get(p.getSemo().getId()),
                        participantCounts.getOrDefault(p.getSemo().getId(), 0L))))
                .toList();
    }

    private SemoCard toCard(Participant participant, SemoPhotoStat stat, long participantCount) {
        Semo semo = participant.getSemo();
        LocalDate date = (stat != null && stat.firstTakenAt() != null)
                ? stat.firstTakenAt().toLocalDate()
                : semo.getCreatedAt().toLocalDate();
        return new SemoCard(
                semo.getId(),
                semo.getName(),
                fileStorage.getUrl(semo.getCoverImageKey()),
                date,
                stat == null ? 0 : stat.photoCount(),
                participantCount,
                participant.getRole());
    }

    // 모두 최신순(내림차순). 같으면 나중에 만든 세모가 먼저
    private List<Row> sort(List<Row> rows, SemoSort sort) {
        Comparator<Row> comparator = switch (sort) {
            case ACTIVITY -> Comparator.comparing((Row r) -> r.semo().getLastActivityAt());
            case CREATED -> Comparator.comparing((Row r) -> r.semo().getCreatedAt());
            case DATE -> Comparator.comparing((Row r) -> r.card().date());
        };
        comparator = comparator.thenComparing(r -> r.semo().getId());
        return rows.stream().sorted(comparator.reversed()).toList();
    }
}
