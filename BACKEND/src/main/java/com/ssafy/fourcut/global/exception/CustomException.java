package com.ssafy.fourcut.global.exception;

import lombok.Getter;

@Getter
public class CustomException extends RuntimeException {
    private final int statusCode;

    // message 필드는 RuntimeException.getMessage() 로 충분하므로 제거했습니다.

    public CustomException(int statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
    }

    // cause 를 받을 수 있는 생성자 추가
    public CustomException(int statusCode, String message, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
    }

}
