package kr.co.pib.repository.tour;

import kr.co.pib.entity.tour.RestaurantList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RestaurantListRepository extends JpaRepository<RestaurantList, Long> {
}
