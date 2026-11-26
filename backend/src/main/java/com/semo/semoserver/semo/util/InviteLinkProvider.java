package com.semo.semoserver.semo.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class InviteLinkProvider {

    private final String frontBaseUrl;

    public InviteLinkProvider(@Value("${semo.front-base-url}") String frontBaseUrl) {
        this.frontBaseUrl = frontBaseUrl.endsWith("/")
                ? frontBaseUrl.substring(0, frontBaseUrl.length() - 1)
                : frontBaseUrl;
    }

    public String inviteUrl(String inviteCode) {
        return frontBaseUrl + "/join/" + inviteCode;
    }
}
