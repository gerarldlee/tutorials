package com.batch;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.item.ItemWriter;

import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.Properties;

public class CustomItemWriter implements ItemWriter<Model> {

    private static Logger log = LoggerFactory.getLogger(CustomItemWriter.class);

    public void write(List<? extends Model> list) throws Exception {

        Model l = null;

        for (Model m: list) {
            log.info(m.getId() + " ... written");
            l = m;
        }

        try {
            Properties p = new Properties();
            OutputStream s = new FileOutputStream("./state.properties");

            if (l != null) {
                p.setProperty("storyid", String.valueOf(l.getId()));
                p.store(s, "");
            }
        }
        catch (Exception e) {
            log.info("Error writing state.properties");
        }
    }
}
