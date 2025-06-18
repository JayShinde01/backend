-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Apr 25, 2025 at 08:09 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `inventary_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `customer_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `phone_mobile` varchar(15) NOT NULL,
  `phone2` varchar(15) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `address2` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`customer_id`, `full_name`, `status`, `phone_mobile`, `phone2`, `email`, `address`, `address2`, `city`, `district`) VALUES
(1, 'Jay Shinde', 'Active', '08767258243', '09172645956', 'jay.shinde@gmail.com', 'KBP Boys Hostel', 'Near Sadar Bazar', 'Satara', 'Satara'),
(2, 'Abhay Gaikwad', 'Active', '09666555555', '08324456789', 'abhay.g@gmail.com', 'Shivaji Nagar', 'Opposite Main Gate', 'Satara', 'Satara'),
(3, 'Jyotiram Kokane', 'Active', '09322123444', '08627444455', 'jyotiram.kokane@yahoo.com', 'MG Road', 'Near Petrol Pump', 'Karad', 'Satara'),
(4, 'Sagar Pawar', 'Active', '09188774567', '08678345882', 'sagar.pawar@gmail.com', 'Old MIDC', 'Gate No. 2', 'Solapur', 'Solapur'),
(5, 'Anil Maruti Shinde', 'Active', '09172645956', '07823665423', 'anil.shinde@rediffmail.com', 'Chambhar Galli', 'AP: Ule', 'Solapur', 'Solapur'),
(6, 'karan Shinde', 'Active', '08767258245', '08625412231', 'jay.a.shinde@gmail.com', 'Chambhar Galli', 'AP: Ule', 'Solapur', 'Solapur'),
(7, 'Onkar Jadhav', 'Active', '07798765432', '08512365478', 'onkar.jadhav@hotmail.com', 'KBP Boys Hostel', 'Room No. 203', 'Satara', 'Satara'),
(8, 'Nikhil Patil', 'Active', '09872634123', '07456123984', 'nikhil.p@gmail.com', 'Shiv Colony', 'Lane 4', 'Baramati', 'Pune'),
(9, 'Mahesh Salunke', 'Active', '07856231478', '06345227891', 'mahesh.salunke@yahoo.in', 'Main Chowk', 'Near Bus Stand', 'Phaltan', 'Satara'),
(10, 'Rahul Deshmukh', 'Active', '07689123345', '08734126789', 'rahul.d@gmail.com', 'Vijay Nagar', 'Flat No. 2B', 'Pandharpur', 'Solapur');

-- --------------------------------------------------------

--
-- Table structure for table `item`
--

CREATE TABLE `item` (
  `productID` int(11) NOT NULL,
  `itemNumber` varchar(255) NOT NULL,
  `itemName` varchar(255) NOT NULL,
  `discount` float NOT NULL DEFAULT 0,
  `stock` int(11) NOT NULL DEFAULT 0,
  `unitPrice` float NOT NULL DEFAULT 0,
  `imageURL` varchar(255) NOT NULL DEFAULT 'imageNotAvailable.jpg',
  `status` varchar(255) NOT NULL DEFAULT 'Active',
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `item`
--

INSERT INTO `item` (`productID`, `itemNumber`, `itemName`, `discount`, `stock`, `unitPrice`, `imageURL`, `status`, `description`) VALUES
(1, 'TP001', 'Clutch Plate', 12.5, 100, 850, 'clutch_plate.jpg', 'Active', 'Heavy-duty clutch plate'),
(2, 'TP002', 'Brake Shoe', 10, 80, 420, 'brake_shoe.jpg', 'Active', 'Front brake shoe'),
(3, 'TP003', 'Steering Rod', 15, 50, 1200, 'steering_rod.jpg', 'Active', 'Power steering rod'),
(4, 'TP004', 'Hydraulic Pump', 18, 30, 3500, 'hydraulic_pump.jpg', 'Active', 'Hydraulic lift pump'),
(5, 'TP005', 'Oil Seal', 5, 200, 75, 'oil_seal.jpg', 'Active', 'High-quality oil seal'),
(6, 'TP006', 'Air Filter', 8, 90, 220, 'air_filter.jpg', 'Active', 'Engine air filter'),
(7, 'TP007', 'Fuel Injector', 20, 25, 2600, 'fuel_injector.jpg', 'Active', 'Diesel fuel injector'),
(8, 'TP008', 'Gear Box', 22.5, 10, 8900, 'gear_box.jpg', 'Active', 'Main transmission gear box'),
(9, 'TP009', 'Radiator', 16, 15, 3200, 'radiator.jpg', 'Active', 'Tractor radiator'),
(10, 'TP010', 'Headlight', 6, 40, 450, 'headlight.jpg', 'Active', 'Front headlight');

-- --------------------------------------------------------

--
-- Table structure for table `sales_invoice`
--

CREATE TABLE `sales_invoice` (
  `invoice_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `invoice_date` datetime NOT NULL,
  `due_date` datetime DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `total_discount` decimal(10,2) DEFAULT NULL,
  `total_tax` decimal(10,2) DEFAULT NULL,
  `total_payable` decimal(10,2) DEFAULT NULL,
  `paid_amount` decimal(10,2) DEFAULT NULL,
  `due_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('Paid','Unpaid','Partially Paid') DEFAULT 'Unpaid',
  `invoice_no` varchar(50) DEFAULT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `payment_mode` varchar(50) DEFAULT NULL,
  `tax` decimal(10,2) DEFAULT NULL,
  `discount` decimal(10,2) DEFAULT NULL,
  `grand_total` decimal(10,2) DEFAULT NULL,
  `note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_invoice_items`
--

CREATE TABLE `sales_invoice_items` (
  `id` int(11) NOT NULL,
  `invoice_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `itemNumber` varchar(50) DEFAULT NULL,
  `itemName` varchar(100) DEFAULT NULL,
  `quantity` int(11) DEFAULT 0,
  `unitPrice` decimal(10,2) DEFAULT 0.00,
  `discount` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `loginid` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `loginid`, `password`) VALUES
(1, 'admin', 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `vendors`
--

CREATE TABLE `vendors` (
  `vendor_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `phone_mobile` varchar(15) NOT NULL,
  `phone_2` varchar(15) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` varchar(255) NOT NULL,
  `address_2` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `district` enum('Colombo','Gampaha','Kandy') NOT NULL DEFAULT 'Colombo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendors`
--

INSERT INTO `vendors` (`vendor_id`, `full_name`, `status`, `phone_mobile`, `phone_2`, `email`, `address`, `address_2`, `city`, `district`, `created_at`, `updated_at`) VALUES
(1, 'Jay Shinde', 'Active', '08767258243', '09172645956', 'jay.spareparts@gmail.com', 'KBP Boys Hostel', 'Near Sadar Bazar', 'Satara', '', '2025-04-23 02:26:55', '2025-04-23 02:26:55'),
(2, 'Vijay Traders', 'Active', '09283456123', '08745612345', 'vijay.traders@gmail.com', 'MIDC Industrial Area', 'Plot No. 45', 'Solapur', '', '2025-04-23 02:30:00', '2025-04-23 02:30:00'),
(3, 'Sanjay Auto Spares', 'Active', '09876543210', '07765432109', 'sanjay.auto@spareparts.com', 'Main Road', 'Opp. State Bank', 'Karad', '', '2025-04-23 02:35:00', '2025-04-23 02:35:00'),
(4, 'Deshmukh Suppliers', 'Active', '09123456789', '08543781234', 'deshmukh.supply@gmail.com', 'Market Yard', 'Shop No. 12', 'Phaltan', '', '2025-04-23 02:40:00', '2025-04-23 02:40:00'),
(5, 'Maruti Enterprises', 'Active', '07789123456', '08123456789', 'maruti.ent@gmail.com', 'Industrial Zone', 'Sector B', 'Baramati', '', '2025-04-23 02:45:00', '2025-04-23 02:45:00'),
(6, 'Ravi Spare Mart', 'Active', '09987654321', '08012345678', 'ravi.mart@yahoo.com', 'Pune Road', 'Near Petrol Pump', 'Pandharpur', '', '2025-04-23 02:50:00', '2025-04-23 02:50:00'),
(7, 'Om Tractor Parts', 'Active', '07896543210', '07912345678', 'om.tractor@gmail.com', 'Chowk Area', 'Lane No. 3', 'Satara', '', '2025-04-23 02:55:00', '2025-04-23 02:55:00'),
(8, 'Patil Auto Agencies', 'Active', '09786543210', '07432109876', 'patil.auto@gmail.com', 'Galli No. 5', 'Near Ganpati Mandir', 'Solapur', '', '2025-04-23 03:00:00', '2025-04-23 03:00:00'),
(9, 'Nikhil Traders', 'Active', '07654321098', '07234567891', 'nikhil.traders@gmail.com', 'Station Road', 'Beside RTO Office', 'Karad', '', '2025-04-23 03:05:00', '2025-04-23 03:05:00'),
(10, 'Anil Auto Zone', 'Active', '07543210987', '07123456789', 'anil.autozone@gmail.com', 'MIDC Area', 'Shop No. 9', 'Satara', '', '2025-04-23 03:10:00', '2025-04-23 03:10:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customer_id`),
  ADD UNIQUE KEY `phone_mobile` (`phone_mobile`);

--
-- Indexes for table `item`
--
ALTER TABLE `item`
  ADD PRIMARY KEY (`productID`),
  ADD UNIQUE KEY `unique_itemnumber` (`itemNumber`);

--
-- Indexes for table `sales_invoice`
--
ALTER TABLE `sales_invoice`
  ADD PRIMARY KEY (`invoice_id`);

--
-- Indexes for table `sales_invoice_items`
--
ALTER TABLE `sales_invoice_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `vendors`
--
ALTER TABLE `vendors`
  ADD PRIMARY KEY (`vendor_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `item`
--
ALTER TABLE `item`
  MODIFY `productID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `sales_invoice`
--
ALTER TABLE `sales_invoice`
  MODIFY `invoice_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_invoice_items`
--
ALTER TABLE `sales_invoice_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `vendors`
--
ALTER TABLE `vendors`
  MODIFY `vendor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
use inventary_db;
ALTER TABLE `item`
CHANGE COLUMN `Date` `invoiceDate` DATE DEFAULT NULL;

select * from item;

ALTER TABLE `sales_invoice`
  DROP COLUMN `due_date`,
  DROP COLUMN `total_amount`,
  DROP COLUMN `tax`,
  DROP COLUMN `discount`,
  DROP COLUMN `grand_total`,
  DROP COLUMN `note`;
ALTER TABLE `item`
DROP COLUMN `invoiceDate`;

select * from customers;