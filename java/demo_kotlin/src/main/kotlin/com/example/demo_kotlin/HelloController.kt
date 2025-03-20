package com.example.demo_kotlin

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class HelloController(val helloService: HelloService) {

    @GetMapping("/hello")
    fun helloKotlin(): String {
        return "hello"
    }

    @GetMapping("/hello-service")
    fun helloKotlinService(): String {
        return helloService.hello()
    }

    @GetMapping("/hello-service-gerard")
    fun helloKotlinServiceGerard(): String {
        return helloService.java()
    }

    @GetMapping("/hello-dto")
    fun helloDto(): Hello {
        return Hello("Hello from the dto")
    }

    @GetMapping("/hello-java")
    fun helloJava(): List<String> {
        var list = ArrayList<String>()

        list.add("one")
        list.add("two")
        list.add("three")

        return list
    }
}