CREATE DATABASE IF NOT EXISTS projects
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE projects;

CREATE TABLE IF NOT EXISTS product_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL COMMENT '商品名称',
  product_type VARCHAR(50) NOT NULL COMMENT '商品类型',
  metal_material VARCHAR(80) NOT NULL COMMENT '金属材料',
  total_weight VARCHAR(50) NOT NULL COMMENT '总重量',
  side_stone VARCHAR(120) NOT NULL COMMENT '副石',
  size_info VARCHAR(120) NOT NULL COMMENT '尺寸',
  price DECIMAL(10, 2) NOT NULL COMMENT '价格',
  product_series VARCHAR(80) NOT NULL COMMENT '商品系列',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='商品详情数据表';

TRUNCATE TABLE product_details;

INSERT INTO product_details
  (product_name, product_type, metal_material, total_weight, side_stone, size_info, price, product_series)
VALUES
  ('S925培育白钻圆形手链', '手链', 'S925银', '1.86g', '培育白钻约1ct/50颗', '圆形约1.9mm，链长可调节', 2268.00, 'S925系列'),
  ('晨曦钻戒', '戒指', '18K白金', '2.86g', '圆钻约0.12ct', '9-16号圈口可定制', 6980.00, '晨曦系列'),
  ('星河项链', '项链', '18K玫瑰金', '3.12g', '圆钻约0.18ct', '40cm+5cm调节链', 4580.00, '星河系列'),
  ('蓝境彩宝戒', '戒指', '18K白金', '4.36g', '梯方钻与圆钻围镶', '10-15号圈口可定制', 12800.00, '蓝境系列'),
  ('月相珍珠耳坠', '耳饰', '18K黄金', '2.04g', '无', '珍珠约7.5mm，耳针式', 2680.00, '月相系列'),
  ('S925微光锁骨链', '项链', 'S925银', '2.35g', '锆石约0.22ct', '38cm+6cm调节链', 1680.00, 'S925系列'),
  ('晨曦光环耳钉', '耳饰', '18K白金', '1.98g', '圆钻合计约0.24ct', '直径约8mm，耳堵式', 3880.00, '晨曦系列'),
  ('星河钻线手链', '手链', '18K白金', '5.18g', '圆钻合计约0.62ct', '16cm+2cm调节链', 8980.00, '星河系列'),
  ('花影开口戒', '戒指', '18K玫瑰金', '3.24g', '粉色蓝宝石约0.16ct', '开口可微调', 5280.00, '花影系列'),
  ('雾光几何耳环', '耳饰', 'S925银', '3.58g', '白色锆石约0.30ct', '约18mm x 12mm', 1380.00, '雾光系列'),
  ('鎏金圆牌项链', '项链', '18K黄金', '4.02g', '无', '42cm链长', 3980.00, '鎏金系列'),
  ('海盐珍珠手链', '手链', 'S925银', '4.80g', '淡水珍珠6颗', '15cm+3cm调节链', 1880.00, '海盐系列'),
  ('极光椭圆钻戒', '戒指', '铂金PT950', '4.12g', '圆钻合计约0.20ct', '11-16号圈口可定制', 15800.00, '极光系列'),
  ('流光水滴耳坠', '耳饰', '18K白金', '2.76g', '圆钻合计约0.28ct', '长度约26mm', 5980.00, '流光系列'),
  ('贝母四叶项链', '项链', '18K黄金', '3.66g', '白贝母镶嵌', '40cm+5cm调节链', 6680.00, '幸运系列'),
  ('雪影排钻戒', '戒指', '18K白金', '2.92g', '排镶圆钻约0.35ct', '9-17号圈口可定制', 7600.00, '雪影系列'),
  ('星点细链手链', '手链', '18K玫瑰金', '1.72g', '圆钻约0.08ct', '15cm+3cm调节链', 3280.00, '星河系列'),
  ('银月耳钉', '耳饰', 'S925银', '1.20g', '锆石约0.10ct', '直径约6mm', 980.00, '月相系列'),
  ('蓝调托帕石项链', '项链', '18K白金', '3.44g', '托帕石约1.20ct', '41cm+4cm调节链', 7200.00, '蓝境系列'),
  ('玫瑰藤蔓戒', '戒指', '18K玫瑰金', '3.08g', '圆钻合计约0.15ct', '10-16号圈口可定制', 4860.00, '花影系列');

SELECT COUNT(*) AS inserted_count FROM product_details;
