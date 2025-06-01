-- Script tạo options tự động cho tất cả câu hỏi từ vựng điền vào chỗ trống
-- File này sẽ tự động tạo các options (A, B, C, D) cho tất cả 600 câu hỏi

-- Tạo procedure để tự động thêm options cho mỗi câu hỏi
DELIMITER //
CREATE PROCEDURE GenerateOptionsForVocabularyQuestions()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE question_id BIGINT;
    DECLARE question_text VARCHAR(500);
    DECLARE correct_ans VARCHAR(100);
    DECLARE difficulty VARCHAR(20);
    DECLARE topic_id INT;
    
    -- Cursor để duyệt qua tất cả câu hỏi từ vựng
    DECLARE cur CURSOR FOR 
        SELECT id, question, correct_answer, difficulty_level, question_group_id 
        FROM toeic_questions 
        WHERE category = 'VOCABULARY' 
        ORDER BY question_group_id, question_order;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Xóa options hiện có để tránh trùng lặp
    DELETE FROM toeic_options WHERE question_id IN (
        SELECT id FROM toeic_questions WHERE category = 'VOCABULARY'
    );
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO question_id, question_text, correct_ans, difficulty, topic_id;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Tìm các từ tương tự để làm options sai
        SET @wrong_options_query = CONCAT('
            SELECT correct_answer 
            FROM toeic_questions 
            WHERE category = "VOCABULARY" 
            AND question_group_id = ', topic_id, ' 
            AND correct_answer != "', correct_ans, '"
            AND id != ', question_id, '
            ORDER BY RAND() 
            LIMIT 3
        ');
        
        -- Thêm option đúng (vị trí ngẫu nhiên từ A-D)
        SET @correct_option_key = ELT(FLOOR(1 + RAND() * 4), 'A', 'B', 'C', 'D');
        
        -- Thêm option đúng
        INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
        VALUES (@correct_option_key, correct_ans, true, question_id);
        
        -- Sử dụng cursor con để lấy và thêm các options sai
        BEGIN
            DECLARE wrong_ans VARCHAR(100);
            DECLARE wrong_options_done INT DEFAULT FALSE;
            DECLARE wrong_options_cur CURSOR FOR 
                SELECT correct_answer 
                FROM toeic_questions 
                WHERE category = 'VOCABULARY' 
                AND question_group_id = topic_id
                AND correct_answer != correct_ans
                AND id != question_id
                ORDER BY RAND() 
                LIMIT 3;
            
            DECLARE CONTINUE HANDLER FOR NOT FOUND SET wrong_options_done = TRUE;
            
            OPEN wrong_options_cur;
            
            -- Mảng chứa các option keys còn lại (không bao gồm option đúng)
            SET @remaining_keys = CASE 
                WHEN @correct_option_key = 'A' THEN 'B,C,D'
                WHEN @correct_option_key = 'B' THEN 'A,C,D'
                WHEN @correct_option_key = 'C' THEN 'A,B,D'
                WHEN @correct_option_key = 'D' THEN 'A,B,C'
            END;
            
            SET @key_index = 1;
            
            wrong_options_loop: LOOP
                FETCH wrong_options_cur INTO wrong_ans;
                
                IF wrong_options_done THEN
                    LEAVE wrong_options_loop;
                END IF;
                
                -- Lấy một option key từ mảng các keys còn lại
                SET @current_key = SUBSTRING_INDEX(SUBSTRING_INDEX(@remaining_keys, ',', @key_index), ',', -1);
                
                -- Thêm option sai
                INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
                VALUES (@current_key, wrong_ans, false, question_id);
                
                SET @key_index = @key_index + 1;
            END LOOP;
            
            CLOSE wrong_options_cur;
            
            -- Nếu không đủ 3 options sai từ cùng chủ đề, thêm options bổ sung
            SET @count_options = (SELECT COUNT(*) FROM toeic_options WHERE question_id = question_id);
            
            IF @count_options < 4 THEN
                -- Lấy danh sách các keys còn thiếu
                SET @missing_keys = (
                    SELECT GROUP_CONCAT(k.key_val)
                    FROM (
                        SELECT 'A' AS key_val UNION SELECT 'B' UNION SELECT 'C' UNION SELECT 'D'
                    ) k
                    WHERE k.key_val NOT IN (
                        SELECT option_key FROM toeic_options WHERE question_id = question_id
                    )
                );
                
                -- Lấy các từ từ các chủ đề khác làm options bổ sung
                SET @additional_options_query = CONCAT('
                    SELECT correct_answer 
                    FROM toeic_questions 
                    WHERE category = "VOCABULARY" 
                    AND question_group_id != ', topic_id, ' 
                    AND correct_answer != "', correct_ans, '"
                    ORDER BY RAND() 
                    LIMIT ', 4 - @count_options
                );
                
                SET @key_index = 1;
                
                BEGIN
                    DECLARE additional_ans VARCHAR(100);
                    DECLARE additional_options_done INT DEFAULT FALSE;
                    DECLARE additional_options_cur CURSOR FOR 
                        SELECT correct_answer 
                        FROM toeic_questions 
                        WHERE category = 'VOCABULARY' 
                        AND question_group_id != topic_id
                        AND correct_answer != correct_ans
                        ORDER BY RAND() 
                        LIMIT (4 - @count_options);
                    
                    DECLARE CONTINUE HANDLER FOR NOT FOUND SET additional_options_done = TRUE;
                    
                    OPEN additional_options_cur;
                    
                    additional_options_loop: LOOP
                        FETCH additional_options_cur INTO additional_ans;
                        
                        IF additional_options_done THEN
                            LEAVE additional_options_loop;
                        END IF;
                        
                        -- Lấy một option key từ mảng các keys còn thiếu
                        SET @current_key = SUBSTRING_INDEX(SUBSTRING_INDEX(@missing_keys, ',', @key_index), ',', -1);
                        
                        -- Thêm option sai bổ sung
                        INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
                        VALUES (@current_key, additional_ans, false, question_id);
                        
                        SET @key_index = @key_index + 1;
                    END LOOP;
                    
                    CLOSE additional_options_cur;
                END;
            END IF;
        END;
        
    END LOOP;
    
    CLOSE cur;
    
    -- Đếm số lượng câu hỏi đã tạo options
    SELECT CONCAT('Đã tạo options cho ', COUNT(DISTINCT question_id), ' câu hỏi từ vựng') AS message
    FROM toeic_options
    WHERE question_id IN (SELECT id FROM toeic_questions WHERE category = 'VOCABULARY');
    
END //
DELIMITER ;

-- Gọi procedure để tạo options
CALL GenerateOptionsForVocabularyQuestions();

-- Xóa procedure sau khi sử dụng
DROP PROCEDURE IF EXISTS GenerateOptionsForVocabularyQuestions;

-- Hướng dẫn sử dụng
-- 1. Thực thi script này sau khi đã thêm tất cả câu hỏi từ vựng vào database
-- 2. Script sẽ tự động tạo options cho tất cả câu hỏi từ vựng
-- 3. Mỗi câu hỏi sẽ có 4 options (A, B, C, D), trong đó một option đúng và ba options sai
-- 4. Options sai được lấy từ các câu hỏi cùng chủ đề hoặc từ các chủ đề khác nếu cần
-- 5. Vị trí của option đúng được chọn ngẫu nhiên (A, B, C hoặc D) 