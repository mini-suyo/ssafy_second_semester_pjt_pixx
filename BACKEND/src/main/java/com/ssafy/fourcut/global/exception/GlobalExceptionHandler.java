package com.ssafy.fourcut.global.exception;

import com.ssafy.fourcut.domain.user.exception.CustomExceptions;
import com.ssafy.fourcut.domain.user.exception.UserNotFoundException;
import com.ssafy.fourcut.global.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomExceptions.MissingCodeException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingCode(CustomExceptions.MissingCodeException ex) {
        return new ResponseEntity<>(
                ApiResponse.<Void>builder()
                        .status(HttpStatus.BAD_REQUEST.value())
                        .message(ex.getMessage())
                        .data(null)
                        .build(),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(CustomExceptions.KakaoApiException.class)
    public ResponseEntity<ApiResponse<Void>> handleKakaoApi(CustomExceptions.KakaoApiException ex) {
        return new ResponseEntity<>(
                ApiResponse.<Void>builder()
                        .status(HttpStatus.UNAUTHORIZED.value())
                        .message(ex.getMessage())
                        .data(null)
                        .build(),
                HttpStatus.UNAUTHORIZED
        );
    }

    @ExceptionHandler(CustomExceptions.JwtInvalidException.class)
    public ResponseEntity<ApiResponse<Void>> handleJwtInvalid(CustomExceptions.JwtInvalidException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.<Void>builder()
                        .status(HttpStatus.UNAUTHORIZED.value())
                        .message(ex.getMessage())
                        .data(null)
                        .build());
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleUserNotFound(UserNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.<Void>builder()
                        .status(HttpStatus.NOT_FOUND.value())
                        .message(ex.getMessage())
                        .data(null)
                        .build());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleJsonParseError(HttpMessageNotReadableException ex) {
        log.warn("Invalid JSON request:", ex);
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.<Void>builder()
                        .status(HttpStatus.BAD_REQUEST.value())
                        .message("잘못된 요청 형식입니다. JSON을 확인해 주세요.")
                        .data(null)
                        .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleAll(Exception ex) {
        log.error("Unhandled exception:", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<Void>builder()
                        .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                        .message("서버 내부 오류가 발생했습니다.")
                        .data(null)
                        .build());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<?> handleMaxSizeException(MaxUploadSizeExceededException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(new ApiResponse<>(413, "업로드 파일 크기가 20MB를 초과했습니다.", null));
    }
}