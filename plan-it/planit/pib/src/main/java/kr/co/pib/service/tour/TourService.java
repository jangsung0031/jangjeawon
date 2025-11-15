package kr.co.pib.service.tour;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import kr.co.pib.dto.tour.*;
import kr.co.pib.entity.*;
import kr.co.pib.entity.tour.*;
import kr.co.pib.repository.*;
import kr.co.pib.repository.tour.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TourService {
    private final TourStatsRepository tourStatsRepository;
    private final TourUserActionsRepository tourUserActionsRepository;
    private final UserRepository userRepository;
    private final TourListRepository tourListRepository;
    private final LeisureSportsListRepository leisureSportsListRepository;
    private final RestaurantListRepository restaurantListRepository;
    private final ShoppingListRepository shoppingListRepository;
    private final CultureListRepository cultureListRepository;
    private final AccommodationListRepository accommodationListRepository;

    public Object getTourDetail(String uniqueKey) {
        String[] parts = uniqueKey.split("-");
        if (parts.length < 2) {
            throw new IllegalArgumentException("유효하지 않은 uniqueKey 형식입니다.");
        }

        String category = parts[0];
        Long id = Long.parseLong(parts[1]);

        return switch (category) {
            case "ACCOMMODATION" -> {
                AccommodationList entity = accommodationListRepository.findById(id)
                        .orElseThrow(() -> new EntityNotFoundException("숙박 정보(ID: " + id + ")를 찾을 수 없습니다."));
                yield AccommodationListDTO.fromEntity(entity);
            }
            case "LEISURE" -> {
                LeisureSportsList entity = leisureSportsListRepository.findById(id)
                        .orElseThrow(() -> new EntityNotFoundException("레저/스포츠 정보(ID: " + id + ")를 찾을 수 없습니다."));
                yield LeisureSportsListDTO.fromEntity(entity);
            }
            case "RESTAURANT" -> {
                RestaurantList entity = restaurantListRepository.findById(id)
                        .orElseThrow(() -> new EntityNotFoundException("식당 정보(ID: " + id + ")를 찾을 수 없습니다."));
                yield RestaurantListDTO.fromEntity(entity);
            }
            case "SHOPPING" -> {
                ShoppingList entity = shoppingListRepository.findById(id)
                        .orElseThrow(() -> new EntityNotFoundException("쇼핑 정보(ID: " + id + ")를 찾을 수 없습니다."));
                yield ShoppingListDTO.fromEntity(entity);
            }
            case "CULTURE" -> {
                CultureList entity = cultureListRepository.findById(id)
                        .orElseThrow(() -> new EntityNotFoundException("문화 시설 정보(ID: " + id + ")를 찾을 수 없습니다."));
                yield CultureListDTO.fromEntity(entity);
            }
            case "TOUR" -> {
                TourList entity = tourListRepository.findById(id)
                        .orElseThrow(() -> new EntityNotFoundException("관광지 정보(ID: " + id + ")를 찾을 수 없습니다."));
                yield TourListDTO.fromEntity(entity);
            }
            default -> throw new IllegalArgumentException("존재하지 않는 카테고리입니다: " + category);
        };
    }

    public boolean checkAndCreateTourData(String uniqueKey) {
        try {
            Optional<TourStats> existingStats = tourStatsRepository.findByIdWithLock(uniqueKey);
            if (existingStats.isPresent()) {
                return true;
            }
            TourStats newStats = TourStats.builder()
                    .id(uniqueKey)
                    .build();

            tourStatsRepository.save(newStats);
            return true;
        }catch (Exception e) {
            log.error("TourStats 데이터 확인 및 생성 중 오류 발생. uniqueKey: {}", uniqueKey, e);
            return false;
        }
    }

    public TourStatsResponseDTO incrementView(String uniqueKey) {
        Optional<TourStats> risingViews = tourStatsRepository.findByIdWithLock(uniqueKey);

        TourStats stats;
        if (risingViews.isPresent()) {
            stats = risingViews.get();
        } else {
            stats = TourStats.builder().id(uniqueKey).build();
        }
        stats.incrementView();
        tourStatsRepository.save(stats);
        return TourStatsResponseDTO.fromEntity(stats);
    }

    public LikeToggledResponseDTO toggleLike(String id, String uniqueKey) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        TourUserActionsId actionId = new TourUserActionsId(user.getUid(), uniqueKey);
        TourUserActions action = tourUserActionsRepository.findById(actionId)
                .orElseGet(() -> TourUserActions.builder()
                        .id(actionId)
                        .user(user)
                        .liked(false)
                        .favorited(false)
                        .build());

        TourStats stats = tourStatsRepository.findByIdWithLock(uniqueKey)
                .orElseGet(() -> TourStats.builder().id(uniqueKey).build());

        if (action.isLiked()) {
            action.setLiked(false);
            stats.decrementLike();
        } else {
            action.setLiked(true);
            stats.incrementLike();
        }

        tourUserActionsRepository.save(action);
        tourStatsRepository.save(stats);

        return LikeToggledResponseDTO.builder()
                .liked(action.isLiked())
                .likeCount(stats.getLikeCount())
                .build();
    }

    public FavoriteToggledResponseDTO toggleFavorite(String id, String uniqueKey) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        TourUserActionsId actionId = new TourUserActionsId(user.getUid(), uniqueKey);
        TourUserActions action = tourUserActionsRepository.findById(actionId)
                .orElseGet(() -> TourUserActions.builder()
                        .id(actionId)
                        .user(user)
                        .liked(false)
                        .favorited(false)
                        .build());

        TourStats stats = tourStatsRepository.findByIdWithLock(uniqueKey)
                .orElseGet(() -> TourStats.builder().id(uniqueKey).build());

        // 토글 처리
        if (action.isFavorited()) {
            action.setFavorited(false);
            stats.decrementFavorite();
        } else {
            action.setFavorited(true);
            stats.incrementFavorite();
        }

        tourUserActionsRepository.save(action);
        tourStatsRepository.save(stats);

        return FavoriteToggledResponseDTO.builder()
                .favorited(action.isFavorited())
                .favoriteCount(stats.getFavoriteCount())
                .build();
    }

    public boolean hasLiked(String id, String uniqueKey) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        return tourUserActionsRepository.findById(new TourUserActionsId(user.getUid(), uniqueKey))
                .map(TourUserActions::isLiked)
                .orElse(false);
    }

    public boolean hasFavorited(String id, String uniqueKey) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        return tourUserActionsRepository.findById(new TourUserActionsId(user.getUid(), uniqueKey))
                .map(TourUserActions::isFavorited)
                .orElse(false);
    }

    public TourActionCountDTO getActionCountsByUserId(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        long favoriteCount = tourUserActionsRepository.countById_UserIdAndFavoritedIsTrue(user.getUid());

        long likeCount = tourUserActionsRepository.countById_UserIdAndLikedIsTrue(user.getUid());

        return TourActionCountDTO.builder()
                .favoriteCount(favoriteCount)
                .likeCount(likeCount)
                .build();
    }
}
