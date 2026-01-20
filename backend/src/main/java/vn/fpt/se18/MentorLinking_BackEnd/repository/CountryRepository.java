package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Country;
import vn.fpt.se18.MentorLinking_BackEnd.util.CONTINENTS;

import java.util.List;
import java.util.Optional;

@Repository
public interface CountryRepository extends JpaRepository<Country, Long> {
    
    // Find all approved countries
    List<Country> findAllByStatus_Code(String code);
    
    // Find country by code
    Optional<Country> findByCode(String code);
    
    // Find country by name
    Optional<Country> findByName(String name);
    
    // Search countries by keyword
    @Query("SELECT c FROM Country c WHERE " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.code) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "c.status.code = :statusCode")
    List<Country> searchCountries(@Param("keyword") String keyword, @Param("statusCode") String statusCode);
    
    // Get all countries with pagination
    Page<Country> findAllByStatus_Code(String code, Pageable pageable);
    
    // Count countries by status
    long countByStatus_Code(String code);
    
    // Get popular countries (most mentors)
    @Query("SELECT c FROM Country c " +
           "JOIN MentorCountry mc ON mc.country.id = c.id " +
           "WHERE c.status.code = 'APPROVED' " +
           "GROUP BY c.id " +
           "ORDER BY COUNT(mc.id) DESC")
    List<Country> findPopularCountries(Pageable pageable);

    // Find countries by continent
    List<Country> findByContinent(CONTINENTS continent);

    // Find approved countries by continent
    @Query("SELECT c FROM Country c WHERE c.continent = :continent AND c.status.code = :statusCode")
    List<Country> findByContinent(@Param("continent") CONTINENTS continent, @Param("statusCode") String statusCode);

    // Find all countries by continent with pagination
    Page<Country> findByContinent(CONTINENTS continent, Pageable pageable);
}
