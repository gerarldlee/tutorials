package com.batch;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.util.Assert;

public class PrintWriterTasklet implements Tasklet, InitializingBean {

    private static Logger log = LoggerFactory.getLogger(PrintWriterTasklet.class);

    private String message;

    public void setMessage(String message) {
        this.message = message;
    }

    public RepeatStatus execute(StepContribution contrib, ChunkContext ctx) throws Exception {

        log.info("Writing something to output using secondJob: " + message);

        return RepeatStatus.FINISHED;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        Assert.notNull(message, "message must be set");
    }
}
