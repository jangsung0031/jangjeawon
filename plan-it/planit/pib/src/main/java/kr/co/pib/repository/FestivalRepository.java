package kr.co.pib.repository;

import kr.co.pib.entity.Festival;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FestivalRepository extends JpaRepository<Festival, Integer> {

    List<Festival> findByCityContaining(String city);
    List<Festival> findByNameContaining(String name);

    // 인기 4 (이미지 있는 행사 중 랜덤 4)
    @Query(value = """
            SELECT * FROM festivallist
            WHERE image_path IS NOT NULL AND image_path <> ''
            ORDER BY RAND() LIMIT 4
            """, nativeQuery = true)
    List<Festival> findTop4Highlights();

    // 추천 10 (다가오는 순)
    @Query(value = """
            SELECT * FROM festivallist
            WHERE startdate IS NOT NULL
            ORDER BY startdate ASC
            LIMIT 10
            """, nativeQuery = true)
    List<Festival> findTop10Recommend();

    // 도시 목록 (검색 셀렉트용)
    @Query("SELECT DISTINCT f.city FROM Festival f WHERE f.city IS NOT NULL AND f.city <> '' ORDER BY f.city ASC")
    List<String> findDistinctCities();

    // 통합 검색/필터
    @Query("""
        SELECT f FROM Festival f
        WHERE
            ( :q IS NULL OR :q = '' OR
              LOWER(f.name) LIKE LOWER(CONCAT('%', :q, '%')) OR
              LOWER(f.addr) LIKE LOWER(CONCAT('%', :q, '%')) OR
              LOWER(f.city) LIKE LOWER(CONCAT('%', :q, '%'))
            )
        AND ( :city IS NULL OR :city = '' OR f.city LIKE CONCAT('%', :city, '%') )
        AND ( :month IS NULL OR :month = '' OR 
              SUBSTRING(f.startdate, 6, 2) = :month OR SUBSTRING(f.enddate, 6, 2) = :month
            )
        ORDER BY f.startdate ASC
    """)
    List<Festival> searchFilter(
            @Param("q") String q,
            @Param("city") String city,
            @Param("month") String month
    );
}
