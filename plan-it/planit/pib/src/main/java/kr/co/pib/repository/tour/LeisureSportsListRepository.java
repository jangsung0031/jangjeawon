package kr.co.pib.repository.tour;

import kr.co.pib.entity.tour.LeisureSportsList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LeisureSportsListRepository extends JpaRepository<LeisureSportsList, Long> {
}
