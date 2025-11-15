package kr.co.th.Controller;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import kr.co.th.vo.User;
import kr.co.th.Repository.UserRepository;
import kr.co.th.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "http://localhost:8080")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    @PostMapping
    public ResponseEntity<?> saveOrUpdate(@RequestBody User user) {
        Optional<User> existing = userRepository.findByUserid(user.getUserid());
        User saved;

        if (existing.isPresent()) {
            User u = existing.get();
            u.setUsername(user.getUsername());
            u.setUserpw(passwordEncoder.encode(user.getUserpw()));
            u.setEmail(user.getEmail());
            u.setTel(user.getTel());
            u.setRole(user.getRole() != null ? user.getRole() : "user");
            saved = userRepository.save(u);
        } else {
            if (user.getRole() == null || user.getRole().isBlank()) {
                user.setRole("user");
            }
            user.setUserpw(passwordEncoder.encode(user.getUserpw()));
            saved = userRepository.save(user);
        }

        String token = jwtUtil.generateToken(saved.getUserid());

        Map<String, Object> response = new HashMap<>();
        response.put("result", "success");
        response.put("token", token);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginUser) {
        Optional<User> optionalUser = userRepository.findByUserid(loginUser.getUserid());

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            String rawPw = loginUser.getUserpw();
            String storedPw = user.getUserpw();
            boolean matches;

            if (storedPw.startsWith("$2a$") || storedPw.startsWith("$2b$")) {
                matches = passwordEncoder.matches(rawPw, storedPw);
            } else {
                matches = rawPw.equals(storedPw);
            }

            if (matches) {
                if (!storedPw.startsWith("$2a$") && !storedPw.startsWith("$2b$")) {
                    user.setUserpw(passwordEncoder.encode(rawPw));
                    userRepository.save(user);
                }

                String token = jwtUtil.generateToken(user.getUserid());
                Map<String, Object> response = new HashMap<>();
                response.put("result", "success");
                response.put("token", token);
                response.put("id", user.getId());
                response.put("userid", user.getUserid());
                response.put("username", user.getUsername());
                response.put("email", user.getEmail());
                response.put("tel", user.getTel());
                response.put("role", user.getRole());

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body("비밀번호가 일치하지 않습니다.");
            }
        } else {
            return ResponseEntity.badRequest().body("존재하지 않는 사용자입니다.");
        }
    }

    @PostMapping("/findid")
    public ResponseEntity<String> findUserId(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String tel = payload.get("tel");

        Optional<User> user = userRepository.findByUsernameAndTel(username, tel);

        if (user.isPresent()) {
            return ResponseEntity.ok(user.get().getUserid());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
        }
    }

    @PostMapping("/resetpw")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> payload) {
        String userid = payload.get("userid");
        String newPassword = payload.get("newPassword");

        Optional<User> optionalUser = userRepository.findByUserid(userid);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setUserpw(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return ResponseEntity.ok("비밀번호 재설정 완료");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("사용자를 찾을 수 없습니다.");
        }
    }



    @GetMapping("/userinfo")
    public ResponseEntity<?> getUserInfo(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("error", "토큰이 유효하지 않거나 누락되었습니다."));
            }

            String userId = jwtUtil.validateAndGetSubject(token.replace("Bearer ", ""));

            return userRepository.findByUserid(userId)
                    .map(user -> {
                        Map<String, Object> userInfo = new HashMap<>();
                        userInfo.put("userid", user.getUserid());
                        userInfo.put("username", user.getUsername());
                        userInfo.put("email", user.getEmail());
                        userInfo.put("tel", user.getTel());
                        return ResponseEntity.ok(userInfo);
                    })
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Collections.singletonMap("error", "사용자를 찾을 수 없습니다.")));

        } catch (ExpiredJwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "토큰이 만료되었습니다."));
        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "유효하지 않은 토큰입니다."));
        }
    }

    @PutMapping("/{userid}")
    public ResponseEntity<?> updateUserInfo(@PathVariable String userid, @RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String tel = payload.get("tel");
        String email = payload.get("email");
        String currentPw = payload.get("currentPw");
        String newPw = payload.get("newPw");

        Optional<User> optionalUser = userRepository.findByUserid(userid);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("사용자를 찾을 수 없습니다.");
        }

        User user = optionalUser.get();

        if (!passwordEncoder.matches(currentPw, user.getUserpw())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("현재 비밀번호가 일치하지 않습니다.");
        }

        user.setUsername(username);
        user.setTel(tel);
        user.setEmail(email);

        if (newPw != null && !newPw.isBlank()) {
            user.setUserpw(passwordEncoder.encode(newPw));
        }

        userRepository.save(user);
        return ResponseEntity.ok("회원 정보가 수정되었습니다.");
    }

}
