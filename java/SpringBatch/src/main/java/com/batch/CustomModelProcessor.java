package com.batch;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.item.ItemProcessor;



public class CustomModelProcessor implements ItemProcessor<Model, Model> {

    private static Logger log = LoggerFactory.getLogger(CustomModelProcessor.class);

    public Model process(Model o) throws Exception {

        Model m = new Model();
        m.setId(o.getId());
        m.setName(o.getName());

        log.info("Converting objects ... " + m.getId());

        return m;
    }
}
