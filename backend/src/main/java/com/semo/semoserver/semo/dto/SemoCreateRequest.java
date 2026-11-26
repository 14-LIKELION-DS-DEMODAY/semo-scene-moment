package com.semo.semoserver.semo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

/**
 * multipart/form-data 요청이라 @RequestBody가 아니라 @ModelAttribute로 받는다.
 * (폼 바인딩은 setter로 값을 넣어서 record 대신 클래스로 만듦)
 */
@Getter
@Setter
@NoArgsConstructor
public class SemoCreateRequest {

    @NotBlank(message = "세모 이름을 입력해 주세요.")
    @Size(max = 30, message = "세모 이름은 1~30자로 입력해 주세요.")
    private String name;

    @NotBlank(message = "닉네임을 입력해 주세요.")
    @Size(max = 10, message = "닉네임은 1~10자로 입력해 주세요.")
    private String nickname;

    @NotBlank(message = "requestId가 필요합니다.")
    @Size(max = 36, message = "requestId는 36자 이하여야 합니다.")
    private String requestId;

    // 선택. 대표 사진 1장
    private MultipartFile coverImage;
}
