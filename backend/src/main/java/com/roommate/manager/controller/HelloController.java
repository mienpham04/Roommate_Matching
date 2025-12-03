package com.roommate.manager.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.roommate.manager.model.TestModel;
import com.roommate.manager.repository.TestRepository;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/hello")
public class HelloController {
    private final TestRepository testRepository;

    public HelloController(TestRepository testRepository) {
        this.testRepository = testRepository;
    }

    @GetMapping("/create")
    public String create() {
        TestModel testModel = new TestModel();
        testModel.setName("Sample Name");
        testRepository.save(testModel);
        return "Created TestModel with ID: " + testModel.getId();
    }
    
    public String hello() {
        return "Hello World";
    }
}
