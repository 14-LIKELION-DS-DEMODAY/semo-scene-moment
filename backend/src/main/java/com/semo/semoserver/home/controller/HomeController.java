package com.semo.semoserver.home.controller;

import com.semo.semoserver.global.auth.CurrentGuest;
import com.semo.semoserver.global.common.ApiResponse;
import com.semo.semoserver.home.dto.HomeResponse;
import com.semo.semoserver.home.dto.SemoCard;
import com.semo.semoserver.home.dto.SemoSort;
import com.semo.semoserver.home.service.HomeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "홈·세모 목록")
@RestController
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;

    @Operation(summary = "홈", description = "기본 닉네임, 이어서 정리하기, 이어서 보기, 활동순 세모 3개")
    @GetMapping("/api/home")
    public ApiResponse<HomeResponse> getHome(@CurrentGuest Long guestId) {
        return ApiResponse.ok(homeService.getHome(guestId));
    }

    @Operation(summary = "참여 중인 세모 목록", description = "keyword: 이름 검색, sort: ACTIVITY(기본) / CREATED / DATE")
    @GetMapping("/api/semos")
    public ApiResponse<List<SemoCard>> getMySemos(
            @CurrentGuest Long guestId,
            @RequestParam(required = false) String keyword,
            @Parameter(description = "ACTIVITY / CREATED / DATE")
            @RequestParam(required = false, defaultValue = "ACTIVITY") String sort) {
        return ApiResponse.ok(homeService.getMySemos(guestId, keyword, SemoSort.from(sort)));
    }
}
