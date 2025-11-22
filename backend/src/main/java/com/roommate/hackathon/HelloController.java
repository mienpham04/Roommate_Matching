package com.roommate.hackathon;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @RequestMapping("/hello")
    public String requestMethodName(@RequestParam String param) {
        return new String();
    }
    
    public String hello() {
        return "Hello World";
    }
}
