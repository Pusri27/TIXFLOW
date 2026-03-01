package com.pusri.ticketing.repository;

import com.pusri.ticketing.entity.SeatCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatCategoryRepository extends JpaRepository<SeatCategory, Long> {
    List<SeatCategory> findByEventId(Long eventId);
}
