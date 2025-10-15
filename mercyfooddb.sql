CREATE DATABASE MercyFoodDB
USE MercyFoodDB

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' and xtype='U')
BEGIN
    CREATE TABLE Users (
        id INT PRIMARY KEY IDENTITY(1,1),
        email NVARCHAR(120) UNIQUE NOT NULL,
        password_hash NVARCHAR(128) NOT NULL,
        full_name NVARCHAR(120) NOT NULL,
        role NVARCHAR(20) NOT NULL,
        restaurant_address NVARCHAR(200) NULL,
        cuisine_type NVARCHAR(50) NULL,
        contact_phone NVARCHAR(15) NULL,
        vehicle_type NVARCHAR(50) NULL
    );
END

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FAQ' and xtype='U')
BEGIN
    CREATE TABLE FAQ (
        id INT PRIMARY KEY IDENTITY(1,1),
        question NVARCHAR(255) NOT NULL,
        answer NVARCHAR(MAX) NOT NULL
    );
END

-- TRUNCATE TABLE Users;