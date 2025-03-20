package com.example.demo_kotlin

import org.springframework.stereotype.Service

@Service
class HelloService {

    fun hello(): String {
        return "hello service"
    }

    fun java(): String {
        var d = Demo()
        d.hello = "Gerard"



        return d.hello
    }
}