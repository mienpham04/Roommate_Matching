package com.roommate.hackathon;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    
    // public String requestMethodName(@RequestParam String param) {
    //     return new String();
    // }
    
    @RequestMapping("/hello")
    public String hello() {
        return "Hello World";
    }
}
