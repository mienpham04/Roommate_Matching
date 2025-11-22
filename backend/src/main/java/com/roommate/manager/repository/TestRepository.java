package com.roommate.manager.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.roommate.manager.model.TestModel;

@Repository
public interface TestRepository extends MongoRepository<TestModel, String> {}
