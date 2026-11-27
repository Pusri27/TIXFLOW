package com.pusri.ticketing.repository;

import com.pusri.ticketing.entity.Event;
import com.pusri.ticketing.entity.EventCategory;
import com.pusri.ticketing.entity.EventStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    @Override
    @EntityGraph(attributePaths = {"venue"})
    List<Event> findAll();

    @EntityGraph(attributePaths = {"venue"})
    List<Event> findAllByOrderByStartTimeAsc();

    @Override
    @EntityGraph(attributePaths = {"venue"})
    Optional<Event> findById(Long id);

    @EntityGraph(attributePaths = {"venue"})
    List<Event> findByStatus(EventStatus status);

    @EntityGraph(attributePaths = {"venue"})
    List<Event> findByCategoryOrderByStartTimeAsc(EventCategory category);

    @EntityGraph(attributePaths = {"venue"})
    List<Event> findByCategory(EventCategory category);
}
