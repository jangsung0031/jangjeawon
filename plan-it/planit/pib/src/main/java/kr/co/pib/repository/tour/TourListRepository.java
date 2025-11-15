package kr.co.pib.repository.tour;

import kr.co.pib.entity.tour.TourList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TourListRepository extends JpaRepository<TourList, Long> {
}
