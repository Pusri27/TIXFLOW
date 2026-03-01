package com.pusri.ticketing.repository;

import com.pusri.ticketing.entity.Event;
import com.pusri.ticketing.entity.EventCategory;
import com.pusri.ticketing.entity.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStatus(EventStatus status);
    List<Event> findByCategory(EventCategory category);
}
