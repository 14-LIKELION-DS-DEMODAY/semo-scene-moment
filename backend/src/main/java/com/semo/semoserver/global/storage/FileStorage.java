package com.semo.semoserver.global.storage;

/**
 * 이미지 저장소. 지금은 로컬 폴더(LocalFileStorage)이고,
 * 배포 때 S3 같은 구현체로 바꾸면 나머지 코드는 그대로 쓸 수 있다.
 */
public interface FileStorage {

    /** 파일을 저장하고 저장소 키를 돌려준다. */
    String upload(byte[] bytes, String directory, String extension);

    /** 저장소 키로 <img src>에 넣을 주소를 만든다. key가 null이면 null */
    String getUrl(String key);

    void delete(String key);
}
