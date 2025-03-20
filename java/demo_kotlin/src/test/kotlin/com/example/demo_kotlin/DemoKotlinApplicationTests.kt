package com.example.demo_kotlin

import junit.framework.Assert.*
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.http.HttpStatus
import org.springframework.test.context.junit4.SpringRunner

//@RunWith(SpringRunner::class)
//@SpringBootTest
@SpringBootTest(classes = arrayOf(DemoKotlinApplication::class),
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class DemoKotlinApplicationTests {

    @Autowired
    lateinit var testRestTemplate: TestRestTemplate

    @Test
    fun whenCalled_shouldReturnHello() {
        val result = testRestTemplate
            // ...
            .getForEntity("/hello", String::class.java)

        assertNotNull(result)
        assertEquals(result?.statusCode, HttpStatus.OK)
        assertEquals(result?.body, "hello")
    }

    @Test
    fun whenCalled_shouldReturnHelloService() {
        var result = testRestTemplate
            // ...
            .getForEntity("/hello-service", String::class.java)

        assertNotNull(result)
        assertEquals(result?.statusCode, HttpStatus.OK)
        assertEquals(result?.body, "hello service")
    }

    @Test
    fun whenCalled_shouldReturnHelloServiceJava() {
        var result = testRestTemplate
            // ...
            .getForEntity("/hello-service-gerard", String::class.java)

        assertNotNull(result)
        assertEquals(result?.statusCode, HttpStatus.OK)
        assertEquals(result?.body, "Gerard appended")
    }

    @Test
    fun whenCalled_shoudlReturnJSON() {
        val result = testRestTemplate
            // ...
            .getForEntity("/hello-dto", Hello::class.java)

        assertNotNull(result)
        assertEquals(result?.statusCode, HttpStatus.OK)
        assertEquals(result?.body, Hello("Hello from the dto"))
    }

    @Test
    fun whenCalled_shoudlReturnList() {
        val result = testRestTemplate
            // ...
            .getForEntity("/hello-java", List::class.java)

        assertNotNull(result)
        assertEquals(result?.statusCode, HttpStatus.OK)

        var list = ArrayList<String>()
        list.add("one")
        list.add("two")
        list.add("three")

        assertEquals(result?.body, list)
    }
}
