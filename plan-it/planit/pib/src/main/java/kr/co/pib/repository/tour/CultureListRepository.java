package kr.co.pib.repository.tour;

import kr.co.pib.entity.tour.CultureList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CultureListRepository extends JpaRepository<CultureList, Long> {
}
