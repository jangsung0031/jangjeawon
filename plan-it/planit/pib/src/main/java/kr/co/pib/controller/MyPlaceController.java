package kr.co.pib.controller;



import kr.co.pib.dto.MyTourCourseRequestDTO;

import kr.co.pib.dto.MyTourCourseResponseDTO;

import kr.co.pib.entity.MyTourCourse;

import kr.co.pib.entity.User;

import kr.co.pib.repository.MyTourCourseRepository;

import kr.co.pib.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.AccessDeniedException;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.*;



import java.time.LocalDateTime;

import java.util.List;

import java.util.Optional;

import java.util.stream.Collectors;



@RestController

@RequestMapping("/api/my-places")

@RequiredArgsConstructor

public class MyPlaceController {



    private final MyTourCourseRepository myTourRepo;

    private final UserRepository userRepo;



    @PostMapping

    public ResponseEntity<?> saveMyPlace(@RequestBody MyTourCourseRequestDTO dto,

                                         @AuthenticationPrincipal String userIdString) {

        User user = userRepo.findById(userIdString).orElseThrow(() -> new AccessDeniedException("사용자를 찾을 수 없습니다."));

        Long userUid = user.getUid();



        if (myTourRepo.existsByUserIdAndContentId(userUid, dto.getContentId())) {

            return ResponseEntity.status(HttpStatus.CONFLICT).body("⚠️ 이미 등록한 여행지입니다.");

        }



        MyTourCourse place = MyTourCourse.builder()

                .userId(userUid)

                .title(dto.getTitle()).addr(dto.getAddr()).imageUrl(dto.getImageUrl())

                .contentId(dto.getContentId()).mapx(dto.getMapx()).mapy(dto.getMapy())

                .regDate(LocalDateTime.now()).build();



        return ResponseEntity.ok(myTourRepo.save(place));

    }



    @GetMapping

    public ResponseEntity<List<MyTourCourseResponseDTO>> getMyPlaces(

            @AuthenticationPrincipal String userIdString) {

        User user = userRepo.findById(userIdString).orElseThrow(() -> new AccessDeniedException("사용자를 찾을 수 없습니다."));

        Long userUid = user.getUid();



        List<MyTourCourse> list = myTourRepo.findByUserId(userUid);

        List<MyTourCourseResponseDTO> result = list.stream()

                .map(c -> new MyTourCourseResponseDTO(c.getId(), c.getTitle(), c.getAddr(), c.getImageUrl()))

                .collect(Collectors.toList());

        return ResponseEntity.ok(result);

    }



    @DeleteMapping("/{id}")

    public ResponseEntity<?> deleteMyPlace(@PathVariable Long id,

                                           @AuthenticationPrincipal String userIdString) {

        User user = userRepo.findById(userIdString).orElseThrow(() -> new AccessDeniedException("사용자를 찾을 수 없습니다."));

        Long userUid = user.getUid();



        Optional<MyTourCourse> place = myTourRepo.findByIdAndUserId(id, userUid);

        if (place.isPresent()) {

            myTourRepo.deleteById(id);

            return ResponseEntity.ok("✅ 삭제 완료");

        } else {

            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("삭제 권한 없음 또는 존재하지 않는 장소입니다.");

        }

    }

}