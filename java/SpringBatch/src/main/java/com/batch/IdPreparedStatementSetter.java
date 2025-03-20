package com.batch;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.PreparedStatementSetter;

import java.sql.PreparedStatement;
import java.sql.SQLException;

public class IdPreparedStatementSetter implements PreparedStatementSetter {

    private static Logger log = LoggerFactory.getLogger(IdPreparedStatementSetter.class);

    private Long id;

    public void setId(Long id) {
        this.id = id;
    }

    @Override
    public void setValues(PreparedStatement ps) throws SQLException {

        log.info("Setting parameter storyid: " + id);
        ps.setLong(1, id);
    }
}
