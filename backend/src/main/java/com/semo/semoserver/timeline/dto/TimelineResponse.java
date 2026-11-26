package com.semo.semoserver.timeline.dto;

import java.time.LocalDate;
import java.util.List;

public record TimelineResponse(
        Long semoId,
        String name,
        List<LocalDate> dates,
        LocalDate selectedDate,
        List<TimelineMoment> moments,
        long undatedPhotoCount,
        boolean isEmpty
) {
}
