CREATE DATABASE  IF NOT EXISTS `mt_logistica` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `mt_logistica`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: mt_logistica
-- ------------------------------------------------------
-- Server version	9.7.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '6e17ef90-a10e-11f1-a04a-0a0027000015:1-114';

--
-- Table structure for table `camiones`
--

DROP TABLE IF EXISTS `camiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `camiones` (
  `ID_CAMION` int NOT NULL AUTO_INCREMENT,
  `NUMERO_CAMION` int NOT NULL,
  `PLACAS` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MARCA` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `MODELO` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ANIO_UNIDAD` year DEFAULT NULL,
  `ESTADO` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Disponible',
  `WIALON_ID` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID_CAMION`),
  UNIQUE KEY `NUMERO_CAMION` (`NUMERO_CAMION`),
  UNIQUE KEY `PLACAS` (`PLACAS`),
  UNIQUE KEY `WIALON_ID` (`WIALON_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `camiones`
--

LOCK TABLES `camiones` WRITE;
/*!40000 ALTER TABLE `camiones` DISABLE KEYS */;
/*!40000 ALTER TABLE `camiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `ID_CLIENTE` int NOT NULL AUTO_INCREMENT,
  `NOMBRE` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `EMPRESA` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `RFC` varchar(13) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID_CLIENTE`),
  UNIQUE KEY `RFC` (`RFC`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes_contacto`
--

DROP TABLE IF EXISTS `clientes_contacto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes_contacto` (
  `ID_CONTACTO` int NOT NULL AUTO_INCREMENT,
  `ID_CLIENTE` int NOT NULL,
  `NOMBRE_CONTACTO` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `CORREO` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TELEFONO` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `DIRECCION` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID_CONTACTO`),
  KEY `FK_CONTACTO_CLIENTE` (`ID_CLIENTE`),
  CONSTRAINT `FK_CONTACTO_CLIENTE` FOREIGN KEY (`ID_CLIENTE`) REFERENCES `clientes` (`ID_CLIENTE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_contacto`
--

LOCK TABLES `clientes_contacto` WRITE;
/*!40000 ALTER TABLE `clientes_contacto` DISABLE KEYS */;
/*!40000 ALTER TABLE `clientes_contacto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_factura`
--

DROP TABLE IF EXISTS `detalle_factura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_factura` (
  `ID_DETALLE_FACTURA` int NOT NULL AUTO_INCREMENT,
  `ID_FACTURA` int NOT NULL,
  `DESCRIPCION` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `CANTIDAD` decimal(10,2) NOT NULL,
  `PRECIO_UNITARIO` decimal(12,2) NOT NULL,
  `IMPORTE` decimal(12,2) NOT NULL,
  PRIMARY KEY (`ID_DETALLE_FACTURA`),
  KEY `FK_DETALLE_FACTURA` (`ID_FACTURA`),
  CONSTRAINT `FK_DETALLE_FACTURA` FOREIGN KEY (`ID_FACTURA`) REFERENCES `facturas` (`ID_FACTURA`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_factura`
--

LOCK TABLES `detalle_factura` WRITE;
/*!40000 ALTER TABLE `detalle_factura` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_factura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_mantenimiento`
--

DROP TABLE IF EXISTS `detalle_mantenimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_mantenimiento` (
  `ID_DETALLE_MANTENIMIENTO` int NOT NULL AUTO_INCREMENT,
  `ID_MANTENIMIENTO` int NOT NULL,
  `DESCRIPCION` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `COSTO` decimal(12,2) DEFAULT NULL,
  `OBSERVACIONES` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID_DETALLE_MANTENIMIENTO`),
  KEY `FK_DETALLE_MANTENIMIENTO` (`ID_MANTENIMIENTO`),
  CONSTRAINT `FK_DETALLE_MANTENIMIENTO` FOREIGN KEY (`ID_MANTENIMIENTO`) REFERENCES `mantenimiento_unidad` (`ID_MANTENIMIENTO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_mantenimiento`
--

LOCK TABLES `detalle_mantenimiento` WRITE;
/*!40000 ALTER TABLE `detalle_mantenimiento` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_mantenimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_orden`
--

DROP TABLE IF EXISTS `detalle_orden`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_orden` (
  `ID_DETALLE_ORDEN` int NOT NULL AUTO_INCREMENT,
  `ID_ORDEN` int NOT NULL,
  `DESCRIPCION_MERCANCIA` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `CANTIDAD` decimal(10,2) DEFAULT NULL,
  `PESO` decimal(10,2) DEFAULT NULL,
  `OBSERVACIONES` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID_DETALLE_ORDEN`),
  KEY `FK_DETALLE_ORDEN` (`ID_ORDEN`),
  CONSTRAINT `FK_DETALLE_ORDEN` FOREIGN KEY (`ID_ORDEN`) REFERENCES `ordenes` (`ID_ORDEN`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_orden`
--

LOCK TABLES `detalle_orden` WRITE;
/*!40000 ALTER TABLE `detalle_orden` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_orden` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentos_camion`
--

DROP TABLE IF EXISTS `documentos_camion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentos_camion` (
  `ID_DOCUMENTO` int NOT NULL AUTO_INCREMENT,
  `ID_CAMION` int NOT NULL,
  `TIPO_DOCUMENTO` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NUMERO_DOCUMENTO` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `FECHA_VENCIMIENTO` date DEFAULT NULL,
  `ESTADO` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID_DOCUMENTO`),
  KEY `FK_DOCUMENTO_CAMION` (`ID_CAMION`),
  CONSTRAINT `FK_DOCUMENTO_CAMION` FOREIGN KEY (`ID_CAMION`) REFERENCES `camiones` (`ID_CAMION`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentos_camion`
--

LOCK TABLES `documentos_camion` WRITE;
/*!40000 ALTER TABLE `documentos_camion` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentos_camion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentos_operador`
--

DROP TABLE IF EXISTS `documentos_operador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentos_operador` (
  `ID_DOCUMENTO` int NOT NULL AUTO_INCREMENT,
  `ID_OPERADOR` int NOT NULL,
  `TIPO_DOCUMENTO` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NUMERO_DOCUMENTO` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `FECHA_VENCIMIENTO` date DEFAULT NULL,
  `ESTADO` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID_DOCUMENTO`),
  KEY `FK_DOCUMENTO_OPERADOR` (`ID_OPERADOR`),
  CONSTRAINT `FK_DOCUMENTO_OPERADOR` FOREIGN KEY (`ID_OPERADOR`) REFERENCES `operadores` (`ID_OPERADOR`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentos_operador`
--

LOCK TABLES `documentos_operador` WRITE;
/*!40000 ALTER TABLE `documentos_operador` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentos_operador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentos_remolque`
--

DROP TABLE IF EXISTS `documentos_remolque`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentos_remolque` (
  `ID_DOCUMENTO` int NOT NULL AUTO_INCREMENT,
  `ID_REMOLQUE` int NOT NULL,
  `TIPO_DOCUMENTO` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NUMERO_DOCUMENTO` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `FECHA_VENCIMIENTO` date DEFAULT NULL,
  `ESTADO` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID_DOCUMENTO`),
  KEY `FK_DOCUMENTO_REMOLQUE` (`ID_REMOLQUE`),
  CONSTRAINT `FK_DOCUMENTO_REMOLQUE` FOREIGN KEY (`ID_REMOLQUE`) REFERENCES `remolque` (`ID_REMOLQUE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentos_remolque`
--

LOCK TABLES `documentos_remolque` WRITE;
/*!40000 ALTER TABLE `documentos_remolque` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentos_remolque` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estados_orden`
--

DROP TABLE IF EXISTS `estados_orden`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estados_orden` (
  `ID_ESTADO_ORDEN` int NOT NULL AUTO_INCREMENT,
  `NOMBRE_ESTADO` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DESCRIPCION` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID_ESTADO_ORDEN`),
  UNIQUE KEY `NOMBRE_ESTADO` (`NOMBRE_ESTADO`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados_orden`
--

LOCK TABLES `estados_orden` WRITE;
/*!40000 ALTER TABLE `estados_orden` DISABLE KEYS */;
INSERT INTO `estados_orden` VALUES (1,'Pendiente','Orden registrada que aún no ha sido programada'),(2,'Programada','Orden asignada y programada para realizarse'),(3,'En tránsito','Servicio actualmente en proceso de traslado'),(4,'Entregada','Mercancía entregada al destino'),(5,'Cancelada','Orden cancelada');
/*!40000 ALTER TABLE `estados_orden` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estados_viaje`
--

DROP TABLE IF EXISTS `estados_viaje`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estados_viaje` (
  `ID_ESTADO_VIAJE` int NOT NULL AUTO_INCREMENT,
  `NOMBRE_ESTADO` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DESCRIPCION` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID_ESTADO_VIAJE`),
  UNIQUE KEY `NOMBRE_ESTADO` (`NOMBRE_ESTADO`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados_viaje`
--

LOCK TABLES `estados_viaje` WRITE;
/*!40000 ALTER TABLE `estados_viaje` DISABLE KEYS */;
INSERT INTO `estados_viaje` VALUES (1,'Programado','Viaje programado que aún no inicia'),(2,'En tránsito','Viaje actualmente en proceso'),(3,'Llegó a destino','La unidad llegó al destino indicado'),(4,'Finalizado','Viaje terminado correctamente'),(5,'Cancelado','Viaje cancelado');
/*!40000 ALTER TABLE `estados_viaje` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facturas`
--

DROP TABLE IF EXISTS `facturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facturas` (
  `ID_FACTURA` int NOT NULL AUTO_INCREMENT,
  `ID_ORDEN` int NOT NULL,
  `FOLIO_FACTURA` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `FECHA_FACTURA` date NOT NULL,
  `SUB_TOTAL_FACTURA` decimal(12,2) NOT NULL,
  `IVA_FACTURA` decimal(12,2) NOT NULL,
  `TOTAL_FACTURA` decimal(12,2) NOT NULL,
  `ESTADO_FACTURA` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pendiente',
  PRIMARY KEY (`ID_FACTURA`),
  UNIQUE KEY `FOLIO_FACTURA` (`FOLIO_FACTURA`),
  KEY `FK_FACTURA_ORDEN` (`ID_ORDEN`),
  CONSTRAINT `FK_FACTURA_ORDEN` FOREIGN KEY (`ID_ORDEN`) REFERENCES `ordenes` (`ID_ORDEN`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facturas`
--

LOCK TABLES `facturas` WRITE;
/*!40000 ALTER TABLE `facturas` DISABLE KEYS */;
/*!40000 ALTER TABLE `facturas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mantenimiento_unidad`
--

DROP TABLE IF EXISTS `mantenimiento_unidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mantenimiento_unidad` (
  `ID_MANTENIMIENTO` int NOT NULL AUTO_INCREMENT,
  `ID_CAMION` int DEFAULT NULL,
  `ID_REMOLQUE` int DEFAULT NULL,
  `ID_TIPO_MANTENIMIENTO` int NOT NULL,
  `FECHA_MANTENIMIENTO` date NOT NULL,
  `KILOMETRAJE_ACTUAL` decimal(10,2) DEFAULT NULL,
  `ESTADO_MANTENIMIENTO` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Programado',
  PRIMARY KEY (`ID_MANTENIMIENTO`),
  KEY `FK_MANTENIMIENTO_CAMION` (`ID_CAMION`),
  KEY `FK_MANTENIMIENTO_REMOLQUE` (`ID_REMOLQUE`),
  KEY `FK_MANTENIMIENTO_TIPO` (`ID_TIPO_MANTENIMIENTO`),
  CONSTRAINT `FK_MANTENIMIENTO_CAMION` FOREIGN KEY (`ID_CAMION`) REFERENCES `camiones` (`ID_CAMION`),
  CONSTRAINT `FK_MANTENIMIENTO_REMOLQUE` FOREIGN KEY (`ID_REMOLQUE`) REFERENCES `remolque` (`ID_REMOLQUE`),
  CONSTRAINT `FK_MANTENIMIENTO_TIPO` FOREIGN KEY (`ID_TIPO_MANTENIMIENTO`) REFERENCES `tipos_mantenimiento` (`ID_TIPO_MANTENIMIENTO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mantenimiento_unidad`
--

LOCK TABLES `mantenimiento_unidad` WRITE;
/*!40000 ALTER TABLE `mantenimiento_unidad` DISABLE KEYS */;
/*!40000 ALTER TABLE `mantenimiento_unidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metodos_pago`
--

DROP TABLE IF EXISTS `metodos_pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metodos_pago` (
  `ID_METODO_PAGO` int NOT NULL AUTO_INCREMENT,
  `NOMBRE_METODO` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DESCRIPCION` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID_METODO_PAGO`),
  UNIQUE KEY `NOMBRE_METODO` (`NOMBRE_METODO`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metodos_pago`
--

LOCK TABLES `metodos_pago` WRITE;
/*!40000 ALTER TABLE `metodos_pago` DISABLE KEYS */;
INSERT INTO `metodos_pago` VALUES (1,'Transferencia','Pago realizado mediante transferencia bancaria'),(2,'Efectivo','Pago realizado en efectivo'),(3,'Cheque','Pago realizado mediante cheque'),(4,'Tarjeta','Pago realizado mediante tarjeta');
/*!40000 ALTER TABLE `metodos_pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operadores`
--

DROP TABLE IF EXISTS `operadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operadores` (
  `ID_OPERADOR` int NOT NULL AUTO_INCREMENT,
  `NOMBRE` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `TELEFONO` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `LICENCIA` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `VIGENCIA_LICENCIA` date DEFAULT NULL,
  `ESTATUS_OPERADOR` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  `NUMERO_SEGURO_SOCIAL` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID_OPERADOR`),
  UNIQUE KEY `LICENCIA` (`LICENCIA`),
  UNIQUE KEY `NUMERO_SEGURO_SOCIAL` (`NUMERO_SEGURO_SOCIAL`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operadores`
--

LOCK TABLES `operadores` WRITE;
/*!40000 ALTER TABLE `operadores` DISABLE KEYS */;
/*!40000 ALTER TABLE `operadores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordenes`
--

DROP TABLE IF EXISTS `ordenes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordenes` (
  `ID_ORDEN` int NOT NULL AUTO_INCREMENT,
  `ID_CLIENTE` int NOT NULL,
  `ID_OPERADOR` int NOT NULL,
  `ID_CAMION` int NOT NULL,
  `ID_REMOLQUE` int DEFAULT NULL,
  `ID_TIPO_SERVICIO` int NOT NULL,
  `ID_TIPO_CARGA` int NOT NULL,
  `ID_ESTADO_ORDEN` int NOT NULL,
  `ORIGEN` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DESTINO` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `FECHA_PEDIDO` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_ORDEN`),
  KEY `FK_ORDEN_CLIENTE` (`ID_CLIENTE`),
  KEY `FK_ORDEN_OPERADOR` (`ID_OPERADOR`),
  KEY `FK_ORDEN_CAMION` (`ID_CAMION`),
  KEY `FK_ORDEN_REMOLQUE` (`ID_REMOLQUE`),
  KEY `FK_ORDEN_SERVICIO` (`ID_TIPO_SERVICIO`),
  KEY `FK_ORDEN_CARGA` (`ID_TIPO_CARGA`),
  KEY `FK_ORDEN_ESTADO` (`ID_ESTADO_ORDEN`),
  CONSTRAINT `FK_ORDEN_CAMION` FOREIGN KEY (`ID_CAMION`) REFERENCES `camiones` (`ID_CAMION`),
  CONSTRAINT `FK_ORDEN_CARGA` FOREIGN KEY (`ID_TIPO_CARGA`) REFERENCES `tipos_carga` (`ID_TIPO_CARGA`),
  CONSTRAINT `FK_ORDEN_CLIENTE` FOREIGN KEY (`ID_CLIENTE`) REFERENCES `clientes` (`ID_CLIENTE`),
  CONSTRAINT `FK_ORDEN_ESTADO` FOREIGN KEY (`ID_ESTADO_ORDEN`) REFERENCES `estados_orden` (`ID_ESTADO_ORDEN`),
  CONSTRAINT `FK_ORDEN_OPERADOR` FOREIGN KEY (`ID_OPERADOR`) REFERENCES `operadores` (`ID_OPERADOR`),
  CONSTRAINT `FK_ORDEN_REMOLQUE` FOREIGN KEY (`ID_REMOLQUE`) REFERENCES `remolque` (`ID_REMOLQUE`),
  CONSTRAINT `FK_ORDEN_SERVICIO` FOREIGN KEY (`ID_TIPO_SERVICIO`) REFERENCES `tipos_servicio` (`ID_TIPO_SERVICIO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordenes`
--

LOCK TABLES `ordenes` WRITE;
/*!40000 ALTER TABLE `ordenes` DISABLE KEYS */;
/*!40000 ALTER TABLE `ordenes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagos`
--

DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos` (
  `ID_PAGO` int NOT NULL AUTO_INCREMENT,
  `ID_FACTURA` int NOT NULL,
  `ID_METODO_PAGO` int NOT NULL,
  `FECHA_PAGO` date NOT NULL,
  `MONTO_PAGO` decimal(12,2) NOT NULL,
  `ESTADO_PAGO` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pendiente',
  PRIMARY KEY (`ID_PAGO`),
  KEY `FK_PAGO_FACTURA` (`ID_FACTURA`),
  KEY `FK_PAGO_METODO` (`ID_METODO_PAGO`),
  CONSTRAINT `FK_PAGO_FACTURA` FOREIGN KEY (`ID_FACTURA`) REFERENCES `facturas` (`ID_FACTURA`),
  CONSTRAINT `FK_PAGO_METODO` FOREIGN KEY (`ID_METODO_PAGO`) REFERENCES `metodos_pago` (`ID_METODO_PAGO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos`
--

LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `remolque`
--

DROP TABLE IF EXISTS `remolque`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `remolque` (
  `ID_REMOLQUE` int NOT NULL AUTO_INCREMENT,
  `NUMERO_REMOLQUE` int NOT NULL,
  `PLACAS` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `TIPO_REMOLQUE` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `MARCA` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ESTADO` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Disponible',
  PRIMARY KEY (`ID_REMOLQUE`),
  UNIQUE KEY `NUMERO_REMOLQUE` (`NUMERO_REMOLQUE`),
  UNIQUE KEY `PLACAS` (`PLACAS`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `remolque`
--

LOCK TABLES `remolque` WRITE;
/*!40000 ALTER TABLE `remolque` DISABLE KEYS */;
/*!40000 ALTER TABLE `remolque` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `ID_ROL` int NOT NULL AUTO_INCREMENT,
  `NOMBRE_ROL` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DESCRIPCION` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID_ROL`),
  UNIQUE KEY `NOMBRE_ROL` (`NOMBRE_ROL`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador','Usuario con acceso completo al sistema'),(2,'Operador','Usuario encargado de gestionar operaciones'),(3,'Facturación','Usuario encargado de gestionar facturas y pagos'),(4,'Consulta','Usuario con acceso únicamente a consultas');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_carga`
--

DROP TABLE IF EXISTS `tipos_carga`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipos_carga` (
  `ID_TIPO_CARGA` int NOT NULL AUTO_INCREMENT,
  `NOMBRE_CARGA` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DESCRIPCION_MERCANCIA` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID_TIPO_CARGA`),
  UNIQUE KEY `NOMBRE_CARGA` (`NOMBRE_CARGA`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_carga`
--

LOCK TABLES `tipos_carga` WRITE;
/*!40000 ALTER TABLE `tipos_carga` DISABLE KEYS */;
INSERT INTO `tipos_carga` VALUES (1,'General','Mercancía general transportada por la empresa');
/*!40000 ALTER TABLE `tipos_carga` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_mantenimiento`
--

DROP TABLE IF EXISTS `tipos_mantenimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipos_mantenimiento` (
  `ID_TIPO_MANTENIMIENTO` int NOT NULL AUTO_INCREMENT,
  `NOMBRE_MANTENIMIENTO` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DESCRIPCION_GENERAL` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID_TIPO_MANTENIMIENTO`),
  UNIQUE KEY `NOMBRE_MANTENIMIENTO` (`NOMBRE_MANTENIMIENTO`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_mantenimiento`
--

LOCK TABLES `tipos_mantenimiento` WRITE;
/*!40000 ALTER TABLE `tipos_mantenimiento` DISABLE KEYS */;
INSERT INTO `tipos_mantenimiento` VALUES (1,'Preventivo','Mantenimiento programado para prevenir fallas y conservar la unidad en buen estado'),(2,'Correctivo','Mantenimiento realizado para reparar fallas o daños detectados en la unidad');
/*!40000 ALTER TABLE `tipos_mantenimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_servicio`
--

DROP TABLE IF EXISTS `tipos_servicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipos_servicio` (
  `ID_TIPO_SERVICIO` int NOT NULL AUTO_INCREMENT,
  `NOMBRE_SERVICIO` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DESCRIPCION` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID_TIPO_SERVICIO`),
  UNIQUE KEY `NOMBRE_SERVICIO` (`NOMBRE_SERVICIO`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_servicio`
--

LOCK TABLES `tipos_servicio` WRITE;
/*!40000 ALTER TABLE `tipos_servicio` DISABLE KEYS */;
INSERT INTO `tipos_servicio` VALUES (1,'Carga dedicada','Servicio de transporte exclusivo para un cliente'),(2,'Local','Servicio de transporte dentro de la zona local'),(3,'Foráneo','Servicio de transporte entre diferentes ciudades o estados');
/*!40000 ALTER TABLE `tipos_servicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `ID_USUARIO` int NOT NULL AUTO_INCREMENT,
  `ID_ROL` int NOT NULL,
  `NOMBRE` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `CORREO` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `CONTRASENA` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ESTADO` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`ID_USUARIO`),
  UNIQUE KEY `CORREO` (`CORREO`),
  KEY `FK_USUARIO_ROL` (`ID_ROL`),
  CONSTRAINT `FK_USUARIO_ROL` FOREIGN KEY (`ID_ROL`) REFERENCES `roles` (`ID_ROL`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `viajes`
--

DROP TABLE IF EXISTS `viajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `viajes` (
  `ID_VIAJE` int NOT NULL AUTO_INCREMENT,
  `ID_ORDEN` int NOT NULL,
  `ID_ESTADO_VIAJE` int NOT NULL,
  `HORA_SALIDA` datetime DEFAULT NULL,
  `HORA_LLEGADA` datetime DEFAULT NULL,
  `KILOMETROS_RECORRIDOS` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`ID_VIAJE`),
  KEY `FK_VIAJE_ORDEN` (`ID_ORDEN`),
  KEY `FK_VIAJE_ESTADO` (`ID_ESTADO_VIAJE`),
  CONSTRAINT `FK_VIAJE_ESTADO` FOREIGN KEY (`ID_ESTADO_VIAJE`) REFERENCES `estados_viaje` (`ID_ESTADO_VIAJE`),
  CONSTRAINT `FK_VIAJE_ORDEN` FOREIGN KEY (`ID_ORDEN`) REFERENCES `ordenes` (`ID_ORDEN`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `viajes`
--

LOCK TABLES `viajes` WRITE;
/*!40000 ALTER TABLE `viajes` DISABLE KEYS */;
/*!40000 ALTER TABLE `viajes` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-03 11:55:49
