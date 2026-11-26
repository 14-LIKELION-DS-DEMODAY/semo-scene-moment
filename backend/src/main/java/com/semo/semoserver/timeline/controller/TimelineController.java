package com.semo.semoserver.timeline.controller;

import com.semo.semoserver.global.auth.CurrentGuest;
import com.semo.semoserver.global.common.ApiResponse;
import com.semo.semoserver.timeline.dto.TimelineResponse;
import com.semo.semoserver.timeline.service.TimelineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@Tag(name = "타임라인 (A)")
@RestController
@RequiredArgsConstructor
public class TimelineController {

    private final TimelineService timelineService;

    @Operation(summary = "세모 보기 (파도형 타임라인)",
            description = "date(yyyy-MM-dd)를 안 보내면 첫 날짜. 부르면 '이어서 보기' 기록이 갱신됨")
    @GetMapping("/api/semos/{semoId}/timeline")
    public ApiResponse<TimelineResponse> getTimeline(
            @CurrentGuest Long guestId,
            @PathVariable Long semoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ApiResponse.ok(timelineService.getTimeline(guestId, semoId, date));
    }
}