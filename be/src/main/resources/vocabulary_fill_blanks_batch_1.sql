-- Script tạo câu hỏi điền từ vào chỗ trống cho các chủ đề từ 1-10
-- Tổng cộng 120 câu hỏi (12 câu mỗi chủ đề)

-- Chủ đề 1: Office and Business
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('We need to prepare the _____ for tomorrow''s meeting.', 'agenda', 'Từ đúng: agenda - Nghĩa: chương trình nghị sự', 'EASY', 'VOCABULARY', 1, 101),
('The _____ for this project is next Friday.', 'deadline', 'Từ đúng: deadline - Nghĩa: hạn chót', 'EASY', 'VOCABULARY', 1, 102),
('A good manager knows how to _____ tasks efficiently.', 'delegate', 'Từ đúng: delegate - Nghĩa: ủy quyền, phân công', 'MEDIUM', 'VOCABULARY', 1, 103),
('Our office _____ include a gym and a cafeteria.', 'facilities', 'Từ đúng: facilities - Nghĩa: cơ sở vật chất', 'MEDIUM', 'VOCABULARY', 1, 104),
('We will _____ the new policy starting next month.', 'implement', 'Từ đúng: implement - Nghĩa: thực hiện, triển khai', 'MEDIUM', 'VOCABULARY', 1, 105),
('The company will _____ a new branch in Ho Chi Minh City next year.', 'establish', 'Từ đúng: establish - Nghĩa: thành lập', 'MEDIUM', 'VOCABULARY', 1, 106),
('All employees must _____ to the company''s code of conduct.', 'adhere', 'Từ đúng: adhere - Nghĩa: tuân thủ', 'HARD', 'VOCABULARY', 1, 107),
('The _____ between the two departments improved project outcomes.', 'collaboration', 'Từ đúng: collaboration - Nghĩa: sự hợp tác', 'MEDIUM', 'VOCABULARY', 1, 108),
('She has a _____ for handling difficult clients with patience.', 'reputation', 'Từ đúng: reputation - Nghĩa: danh tiếng', 'MEDIUM', 'VOCABULARY', 1, 109),
('The company is looking to _____ its market share in Asia.', 'expand', 'Từ đúng: expand - Nghĩa: mở rộng', 'EASY', 'VOCABULARY', 1, 110),
('We need to _____ the best approach to solve this problem.', 'determine', 'Từ đúng: determine - Nghĩa: xác định', 'MEDIUM', 'VOCABULARY', 1, 111),
('The office is closed for _____ on national holidays.', 'business', 'Từ đúng: business - Nghĩa: kinh doanh', 'EASY', 'VOCABULARY', 1, 112);

-- Thêm options cho chủ đề 1 (chỉ lấy vài câu làm ví dụ)
INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'agenda', (SELECT id FROM toeic_questions WHERE question = 'We need to prepare the _____ for tomorrow''s meeting.' AND question_group_id = 1 AND question_order = 101)),
('B', 'inventory', (SELECT id FROM toeic_questions WHERE question = 'We need to prepare the _____ for tomorrow''s meeting.' AND question_group_id = 1 AND question_order = 101)),
('C', 'deadline', (SELECT id FROM toeic_questions WHERE question = 'We need to prepare the _____ for tomorrow''s meeting.' AND question_group_id = 1 AND question_order = 101)),
('D', 'revenue', (SELECT id FROM toeic_questions WHERE question = 'We need to prepare the _____ for tomorrow''s meeting.' AND question_group_id = 1 AND question_order = 101));

-- Chủ đề 2: Travel and Transportation
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('The _____ time of the flight is 3:45 PM.', 'arrival', 'Từ đúng: arrival - Nghĩa: sự đến', 'EASY', 'VOCABULARY', 2, 101),
('Please have your _____ ready for inspection.', 'boarding pass', 'Từ đúng: boarding pass - Nghĩa: thẻ lên máy bay', 'EASY', 'VOCABULARY', 2, 102),
('His daily _____ takes about an hour each way.', 'commute', 'Từ đúng: commute - Nghĩa: đi lại (giữa nhà và nơi làm việc)', 'MEDIUM', 'VOCABULARY', 2, 103),
('The _____ gate has been changed to B12.', 'departure', 'Từ đúng: departure - Nghĩa: sự khởi hành', 'EASY', 'VOCABULARY', 2, 104),
('The bus _____ has increased by 10% this year.', 'fare', 'Từ đúng: fare - Nghĩa: giá vé', 'EASY', 'VOCABULARY', 2, 105),
('The roads were _____ with traffic during rush hour.', 'congested', 'Từ đúng: congested - Nghĩa: tắc nghẽn', 'MEDIUM', 'VOCABULARY', 2, 106),
('We need to _____ a hotel room for our business trip next week.', 'reserve', 'Từ đúng: reserve - Nghĩa: đặt trước', 'EASY', 'VOCABULARY', 2, 107),
('The airline announced a flight _____ due to bad weather.', 'delay', 'Từ đúng: delay - Nghĩa: trì hoãn', 'EASY', 'VOCABULARY', 2, 108),
('The _____ between the two cities is approximately 200 kilometers.', 'distance', 'Từ đúng: distance - Nghĩa: khoảng cách', 'EASY', 'VOCABULARY', 2, 109),
('Passengers should check the _____ screens for updated flight information.', 'departure', 'Từ đúng: departure - Nghĩa: khởi hành', 'EASY', 'VOCABULARY', 2, 110),
('The company provides _____ cars for its executives.', 'luxury', 'Từ đúng: luxury - Nghĩa: sang trọng', 'MEDIUM', 'VOCABULARY', 2, 111),
('The train station is undergoing _____ and will be closed for two weeks.', 'renovation', 'Từ đúng: renovation - Nghĩa: tu sửa', 'MEDIUM', 'VOCABULARY', 2, 112);

-- Chủ đề 3: Employment and Job Hunting
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('She updated her _____ before applying for the job.', 'resume', 'Từ đúng: resume - Nghĩa: sơ yếu lý lịch', 'EASY', 'VOCABULARY', 3, 101),
('The company is conducting _____ for the marketing position next week.', 'interviews', 'Từ đúng: interviews - Nghĩa: phỏng vấn', 'EASY', 'VOCABULARY', 3, 102),
('Many people change their _____ several times during their working life.', 'career', 'Từ đúng: career - Nghĩa: sự nghiệp', 'MEDIUM', 'VOCABULARY', 3, 103),
('The job _____ requires at least five years of experience.', 'description', 'Từ đúng: description - Nghĩa: mô tả công việc', 'MEDIUM', 'VOCABULARY', 3, 104),
('She received a job _____ from the company after her interview.', 'offer', 'Từ đúng: offer - Nghĩa: lời đề nghị', 'EASY', 'VOCABULARY', 3, 105),
('The starting _____ for this position is competitive.', 'salary', 'Từ đúng: salary - Nghĩa: lương', 'EASY', 'VOCABULARY', 3, 106),
('He is looking for a position with more _____ opportunities.', 'advancement', 'Từ đúng: advancement - Nghĩa: thăng tiến', 'MEDIUM', 'VOCABULARY', 3, 107),
('She has excellent _____ for the management position.', 'qualifications', 'Từ đúng: qualifications - Nghĩa: bằng cấp, trình độ', 'MEDIUM', 'VOCABULARY', 3, 108),
('The company offers good _____ benefits, including health insurance.', 'employment', 'Từ đúng: employment - Nghĩa: việc làm', 'MEDIUM', 'VOCABULARY', 3, 109),
('You need to highlight your _____ on your resume to stand out.', 'skills', 'Từ đúng: skills - Nghĩa: kỹ năng', 'EASY', 'VOCABULARY', 3, 110),
('The _____ process includes three rounds of interviews.', 'recruitment', 'Từ đúng: recruitment - Nghĩa: tuyển dụng', 'MEDIUM', 'VOCABULARY', 3, 111),
('She was looking for a job with a better work-life _____.', 'balance', 'Từ đúng: balance - Nghĩa: cân bằng', 'MEDIUM', 'VOCABULARY', 3, 112);

-- Chủ đề 4: Marketing and Sales
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('The company launched a new marketing _____ on social media.', 'campaign', 'Từ đúng: campaign - Nghĩa: chiến dịch', 'MEDIUM', 'VOCABULARY', 4, 101),
('We need to identify our target _____ before developing the marketing strategy.', 'audience', 'Từ đúng: audience - Nghĩa: đối tượng', 'MEDIUM', 'VOCABULARY', 4, 102),
('The product has a unique selling _____ that differentiates it from competitors.', 'proposition', 'Từ đúng: proposition - Nghĩa: đề xuất', 'HARD', 'VOCABULARY', 4, 103),
('The sales team exceeded their quarterly _____ by 15%.', 'targets', 'Từ đúng: targets - Nghĩa: mục tiêu', 'MEDIUM', 'VOCABULARY', 4, 104),
('Customer _____ is essential for long-term business success.', 'loyalty', 'Từ đúng: loyalty - Nghĩa: lòng trung thành', 'MEDIUM', 'VOCABULARY', 4, 105),
('The product is in the _____ phase of its lifecycle.', 'growth', 'Từ đúng: growth - Nghĩa: tăng trưởng', 'MEDIUM', 'VOCABULARY', 4, 106),
('Digital _____ has become an essential part of modern marketing strategies.', 'advertising', 'Từ đúng: advertising - Nghĩa: quảng cáo', 'EASY', 'VOCABULARY', 4, 107),
('The company offers volume _____ for bulk purchases.', 'discounts', 'Từ đúng: discounts - Nghĩa: giảm giá', 'EASY', 'VOCABULARY', 4, 108),
('The _____ of our product exceeds that of our competitors.', 'quality', 'Từ đúng: quality - Nghĩa: chất lượng', 'EASY', 'VOCABULARY', 4, 109),
('We need to _____ our product to different market segments.', 'promote', 'Từ đúng: promote - Nghĩa: quảng bá', 'EASY', 'VOCABULARY', 4, 110),
('The _____ for our new product has been very positive.', 'feedback', 'Từ đúng: feedback - Nghĩa: phản hồi', 'EASY', 'VOCABULARY', 4, 111),
('The sales representative earned a _____ based on his performance.', 'commission', 'Từ đúng: commission - Nghĩa: hoa hồng', 'MEDIUM', 'VOCABULARY', 4, 112);

-- Chủ đề 5: Finance and Banking
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('The company secured a large _____ to finance its expansion plans.', 'loan', 'Từ đúng: loan - Nghĩa: khoản vay', 'EASY', 'VOCABULARY', 5, 101),
('He checked his account _____ to verify the recent transactions.', 'statement', 'Từ đúng: statement - Nghĩa: bảng sao kê', 'MEDIUM', 'VOCABULARY', 5, 102),
('The bank offers competitive _____ rates on savings accounts.', 'interest', 'Từ đúng: interest - Nghĩa: lãi suất', 'MEDIUM', 'VOCABULARY', 5, 103),
('They made a substantial _____ in the technology sector.', 'investment', 'Từ đúng: investment - Nghĩa: đầu tư', 'MEDIUM', 'VOCABULARY', 5, 104),
('The financial _____ showed that the company had a profitable year.', 'report', 'Từ đúng: report - Nghĩa: báo cáo', 'EASY', 'VOCABULARY', 5, 105),
('She manages the company''s _____ and ensures bills are paid on time.', 'budget', 'Từ đúng: budget - Nghĩa: ngân sách', 'EASY', 'VOCABULARY', 5, 106),
('The company issued new _____ to raise capital for expansion.', 'shares', 'Từ đúng: shares - Nghĩa: cổ phiếu', 'MEDIUM', 'VOCABULARY', 5, 107),
('The bank charges a small _____ for international transfers.', 'fee', 'Từ đúng: fee - Nghĩa: phí', 'EASY', 'VOCABULARY', 5, 108),
('The company experienced a significant _____ in profits last quarter.', 'increase', 'Từ đúng: increase - Nghĩa: tăng', 'EASY', 'VOCABULARY', 5, 109),
('We need to analyze the financial _____ before making an investment decision.', 'data', 'Từ đúng: data - Nghĩa: dữ liệu', 'EASY', 'VOCABULARY', 5, 110),
('The company''s _____ include buildings, equipment, and vehicles.', 'assets', 'Từ đúng: assets - Nghĩa: tài sản', 'MEDIUM', 'VOCABULARY', 5, 111),
('The bank offers online _____ services for its customers.', 'banking', 'Từ đúng: banking - Nghĩa: ngân hàng', 'EASY', 'VOCABULARY', 5, 112);

-- Chủ đề 6: Health and Medicine
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('The doctor ordered a blood _____ to check for diabetes.', 'test', 'Từ đúng: test - Nghĩa: xét nghiệm', 'EASY', 'VOCABULARY', 6, 101),
('She was admitted to the _____ after a serious accident.', 'hospital', 'Từ đúng: hospital - Nghĩa: bệnh viện', 'EASY', 'VOCABULARY', 6, 102),
('The patient is making a good _____ after surgery.', 'recovery', 'Từ đúng: recovery - Nghĩa: hồi phục', 'MEDIUM', 'VOCABULARY', 6, 103),
('All employees must have a medical _____ before starting work.', 'examination', 'Từ đúng: examination - Nghĩa: khám sức khỏe', 'MEDIUM', 'VOCABULARY', 6, 104),
('Take two _____ of this medicine three times a day.', 'tablets', 'Từ đúng: tablets - Nghĩa: viên thuốc', 'EASY', 'VOCABULARY', 6, 105),
('The company provides health _____ for all employees.', 'insurance', 'Từ đúng: insurance - Nghĩa: bảo hiểm', 'EASY', 'VOCABULARY', 6, 106),
('She has a _____ appointment next Wednesday.', 'dental', 'Từ đúng: dental - Nghĩa: nha khoa', 'MEDIUM', 'VOCABULARY', 6, 107),
('The doctor recommended regular _____ to reduce stress.', 'exercise', 'Từ đúng: exercise - Nghĩa: tập thể dục', 'EASY', 'VOCABULARY', 6, 108),
('The new treatment has shown promising _____ in clinical trials.', 'results', 'Từ đúng: results - Nghĩa: kết quả', 'MEDIUM', 'VOCABULARY', 6, 109),
('Always read the _____ carefully before taking any medication.', 'instructions', 'Từ đúng: instructions - Nghĩa: hướng dẫn', 'EASY', 'VOCABULARY', 6, 110),
('The patient needs _____ physical therapy after the accident.', 'intensive', 'Từ đúng: intensive - Nghĩa: chuyên sâu', 'MEDIUM', 'VOCABULARY', 6, 111),
('Regular health _____ can detect problems early.', 'checkups', 'Từ đúng: checkups - Nghĩa: kiểm tra', 'EASY', 'VOCABULARY', 6, 112);

-- Chủ đề 7: Technology and Internet
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('Download the mobile _____ to access your account on the go.', 'application', 'Từ đúng: application - Nghĩa: ứng dụng', 'EASY', 'VOCABULARY', 7, 101),
('Always create a _____ of important files before making major changes.', 'backup', 'Từ đúng: backup - Nghĩa: sao lưu', 'EASY', 'VOCABULARY', 7, 102),
('Chrome is the most popular web _____ worldwide.', 'browser', 'Từ đúng: browser - Nghĩa: trình duyệt', 'EASY', 'VOCABULARY', 7, 103),
('The company invested heavily in _____ measures to protect customer data.', 'cybersecurity', 'Từ đúng: cybersecurity - Nghĩa: an ninh mạng', 'MEDIUM', 'VOCABULARY', 7, 104),
('All customer information is stored in our secure _____.', 'database', 'Từ đúng: database - Nghĩa: cơ sở dữ liệu', 'MEDIUM', 'VOCABULARY', 7, 105),
('The IT department installed new _____ to improve network performance.', 'hardware', 'Từ đúng: hardware - Nghĩa: phần cứng', 'MEDIUM', 'VOCABULARY', 7, 106),
('The website has a user-friendly _____ that makes navigation easy.', 'interface', 'Từ đúng: interface - Nghĩa: giao diện', 'MEDIUM', 'VOCABULARY', 7, 107),
('Cloud _____ allows you to access your files from anywhere.', 'storage', 'Từ đúng: storage - Nghĩa: lưu trữ', 'EASY', 'VOCABULARY', 7, 108),
('The new _____ will automate many manual processes.', 'software', 'Từ đúng: software - Nghĩa: phần mềm', 'EASY', 'VOCABULARY', 7, 109),
('High-speed internet _____ is essential for video conferencing.', 'connection', 'Từ đúng: connection - Nghĩa: kết nối', 'EASY', 'VOCABULARY', 7, 110),
('The system will automatically _____ your data every night.', 'backup', 'Từ đúng: backup - Nghĩa: sao lưu', 'EASY', 'VOCABULARY', 7, 111),
('The _____ allows users to search for information quickly.', 'search engine', 'Từ đúng: search engine - Nghĩa: công cụ tìm kiếm', 'EASY', 'VOCABULARY', 7, 112);

-- Chủ đề 8: Manufacturing and Production
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('The company is _____ its production capacity to meet growing demand.', 'expanding', 'Từ đúng: expanding - Nghĩa: mở rộng', 'MEDIUM', 'VOCABULARY', 8, 101),
('The factory has implemented automated _____ lines to increase efficiency.', 'assembly', 'Từ đúng: assembly - Nghĩa: lắp ráp', 'MEDIUM', 'VOCABULARY', 8, 102),
('Quality _____ is an essential part of the manufacturing process.', 'control', 'Từ đúng: control - Nghĩa: kiểm soát', 'MEDIUM', 'VOCABULARY', 8, 103),
('The company has reduced _____ costs by 15% this year.', 'production', 'Từ đúng: production - Nghĩa: sản xuất', 'EASY', 'VOCABULARY', 8, 104),
('All products must meet strict quality _____ before shipping.', 'standards', 'Từ đúng: standards - Nghĩa: tiêu chuẩn', 'MEDIUM', 'VOCABULARY', 8, 105),
('The factory needs to _____ production to meet the holiday season demand.', 'increase', 'Từ đúng: increase - Nghĩa: tăng', 'EASY', 'VOCABULARY', 8, 106),
('Regular _____ of equipment is necessary to prevent breakdowns.', 'maintenance', 'Từ đúng: maintenance - Nghĩa: bảo trì', 'MEDIUM', 'VOCABULARY', 8, 107),
('The manufacturing process generates significant _____ that must be disposed of properly.', 'waste', 'Từ đúng: waste - Nghĩa: chất thải', 'MEDIUM', 'VOCABULARY', 8, 108),
('The company is seeking to improve _____ in its production processes.', 'efficiency', 'Từ đúng: efficiency - Nghĩa: hiệu quả', 'MEDIUM', 'VOCABULARY', 8, 109),
('All _____ must wear safety equipment on the factory floor.', 'workers', 'Từ đúng: workers - Nghĩa: công nhân', 'EASY', 'VOCABULARY', 8, 110),
('We need to _____ the quality of each product before shipping.', 'inspect', 'Từ đúng: inspect - Nghĩa: kiểm tra', 'EASY', 'VOCABULARY', 8, 111),
('The factory operates three _____ to maintain 24-hour production.', 'shifts', 'Từ đúng: shifts - Nghĩa: ca làm việc', 'MEDIUM', 'VOCABULARY', 8, 112);

-- Chủ đề 9: Entertainment and Media
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('The movie won an _____ for Best Picture last year.', 'award', 'Từ đúng: award - Nghĩa: giải thưởng', 'EASY', 'VOCABULARY', 9, 101),
('The _____ was very positive about the new TV series.', 'review', 'Từ đúng: review - Nghĩa: bài đánh giá', 'MEDIUM', 'VOCABULARY', 9, 102),
('The company has a large _____ budget for their new product.', 'advertising', 'Từ đúng: advertising - Nghĩa: quảng cáo', 'MEDIUM', 'VOCABULARY', 9, 103),
('The TV _____ was filmed in several different countries.', 'documentary', 'Từ đúng: documentary - Nghĩa: phim tài liệu', 'MEDIUM', 'VOCABULARY', 9, 104),
('She is a popular _____ on social media with millions of followers.', 'influencer', 'Từ đúng: influencer - Nghĩa: người có ảnh hưởng', 'MEDIUM', 'VOCABULARY', 9, 105),
('The _____ for the new superhero movie generated a lot of excitement.', 'trailer', 'Từ đúng: trailer - Nghĩa: đoạn giới thiệu phim', 'EASY', 'VOCABULARY', 9, 106),
('The music _____ was streamed over a million times in the first week.', 'album', 'Từ đúng: album - Nghĩa: album nhạc', 'EASY', 'VOCABULARY', 9, 107),
('The show was _____ live to audiences around the world.', 'broadcast', 'Từ đúng: broadcast - Nghĩa: phát sóng', 'MEDIUM', 'VOCABULARY', 9, 108),
('The _____ for the concert sold out within minutes.', 'tickets', 'Từ đúng: tickets - Nghĩa: vé', 'EASY', 'VOCABULARY', 9, 109),
('The movie _____ featured some of the biggest stars in Hollywood.', 'cast', 'Từ đúng: cast - Nghĩa: dàn diễn viên', 'MEDIUM', 'VOCABULARY', 9, 110),
('The _____ of the film was magnificent, with stunning visual effects.', 'production', 'Từ đúng: production - Nghĩa: sản xuất', 'MEDIUM', 'VOCABULARY', 9, 111),
('The company produces online _____ for various streaming platforms.', 'content', 'Từ đúng: content - Nghĩa: nội dung', 'MEDIUM', 'VOCABULARY', 9, 112);

-- Chủ đề 10: Food and Dining
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('The restaurant has a new _____ with several vegetarian options.', 'menu', 'Từ đúng: menu - Nghĩa: thực đơn', 'EASY', 'VOCABULARY', 10, 101),
('Please make a _____ if you plan to dine with us on Saturday evening.', 'reservation', 'Từ đúng: reservation - Nghĩa: đặt chỗ', 'EASY', 'VOCABULARY', 10, 102),
('The _____ brought our food quickly and was very professional.', 'waiter', 'Từ đúng: waiter - Nghĩa: người phục vụ', 'EASY', 'VOCABULARY', 10, 103),
('The chef uses only fresh, local _____ in all of his dishes.', 'ingredients', 'Từ đúng: ingredients - Nghĩa: nguyên liệu', 'MEDIUM', 'VOCABULARY', 10, 104),
('The restaurant has a fine selection of wines to _____ with your meal.', 'complement', 'Từ đúng: complement - Nghĩa: bổ sung', 'HARD', 'VOCABULARY', 10, 105),
('The _____ of the meal was included in the total bill.', 'cost', 'Từ đúng: cost - Nghĩa: giá', 'EASY', 'VOCABULARY', 10, 106),
('The restaurant offers a special lunch _____ for business customers.', 'discount', 'Từ đúng: discount - Nghĩa: giảm giá', 'EASY', 'VOCABULARY', 10, 107),
('Please leave a _____ if you were satisfied with the service.', 'tip', 'Từ đúng: tip - Nghĩa: tiền boa', 'EASY', 'VOCABULARY', 10, 108),
('The restaurant has a _____ bar where you can enjoy drinks before dinner.', 'cocktail', 'Từ đúng: cocktail - Nghĩa: cocktail', 'MEDIUM', 'VOCABULARY', 10, 109),
('The dessert _____ includes a variety of cakes and ice creams.', 'selection', 'Từ đúng: selection - Nghĩa: lựa chọn', 'EASY', 'VOCABULARY', 10, 110),
('The restaurant received a prestigious _____ in the food guide.', 'rating', 'Từ đúng: rating - Nghĩa: xếp hạng', 'MEDIUM', 'VOCABULARY', 10, 111),
('The chef has created a special _____ for the holiday season.', 'dish', 'Từ đúng: dish - Nghĩa: món ăn', 'EASY', 'VOCABULARY', 10, 112); 