package rnd.statemachine.order;

import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


/**
 * 
 * @author nallas
 *
 */
@Service
public class OrderDbService {

	private JdbcTemplate jdbcTemplate;
	
	public OrderDbService() {
		DriverManagerDataSource dataSource = new DriverManagerDataSource();
		dataSource.setDriverClassName("org.h2.Driver");
		dataSource.setUrl("jdbc:h2:mem:testdb");
		dataSource.setUsername("SA");
		dataSource.setPassword("");
		this.jdbcTemplate = new JdbcTemplate(dataSource);
	}



    public String getOrderState(UUID uuid) {
    	String sql = "select state from ORDER_STATE where uuid='"+uuid+"'";
    	String res;
    	try {
    	 res = jdbcTemplate.queryForObject(sql, String.class);
    	}catch(Exception e) {
    		res="";
    	}
    	return res;
    }

    @Transactional
    public void saveState(UUID uuid, String state) {
    	String sql;
    	if(!this.getOrderState(uuid).isEmpty()) {
    		sql = "update ORDER_STATE set state='"+state+"' where uuid='"+uuid+"'";
    	} else {
    		sql = "insert into ORDER_STATE(uuid,state) values('"+uuid+"','"+state+"')";
    	} 
    	jdbcTemplate.execute(sql);
    }
}
