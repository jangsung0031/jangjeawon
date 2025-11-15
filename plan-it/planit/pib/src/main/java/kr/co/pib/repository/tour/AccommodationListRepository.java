package kr.co.pib.repository.tour;

import kr.co.pib.entity.tour.AccommodationList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccommodationListRepository extends JpaRepository<AccommodationList, Long> {
}
