package com.semo.semoserver.global.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // 공통
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "입력값이 올바르지 않습니다."),
    UNAUTHORIZED_GUEST(HttpStatus.UNAUTHORIZED, "참여 정보를 확인할 수 없습니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "권한이 없습니다."),
    NOT_FOUND(HttpStatus.NOT_FOUND, "요청한 정보를 찾을 수 없습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다."),

    // 세모·참여 (B)
    SEMO_NOT_FOUND(HttpStatus.NOT_FOUND, "세모를 찾을 수 없습니다."),
    INVITE_NOT_FOUND(HttpStatus.NOT_FOUND, "링크를 찾을 수 없어요."),
    DUPLICATE_NICKNAME(HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다."),
    ALREADY_JOINED(HttpStatus.CONFLICT, "이미 참여한 세모입니다."),
    UNAUTHORIZED_GUEST(HttpStatus.UNAUTHORIZED, "게스트 키가 없거나 올바르지 않습니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "권한이 없습니다."),
    MOMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "Moment를 찾을 수 없습니다."),
    PHOTO_NOT_FOUND(HttpStatus.NOT_FOUND, "사진을 찾을 수 없습니다."),

    // 사진·분석 (A)
    UNSUPPORTED_FILE_TYPE(HttpStatus.BAD_REQUEST, "지원하지 않는 파일 형식입니다."),
    TOO_MANY_FILES(HttpStatus.BAD_REQUEST, "한 번에 올릴 수 있는 사진 수를 넘었습니다."),
    PHOTO_NOT_FOUND(HttpStatus.NOT_FOUND, "사진을 찾을 수 없습니다."),
    MOMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "Moment를 찾을 수 없습니다."),
    ANALYSIS_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "사진을 분석하지 못했어요.");

    private final HttpStatus status;
    private final String message;
}