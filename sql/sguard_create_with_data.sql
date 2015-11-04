/*
SQLyog Community v12.12 (64 bit)
MySQL - 5.6.16 : Database - sguard
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
USE `sguard`;

/*Table structure for table `administradores` */

DROP TABLE IF EXISTS `administradores`;

CREATE TABLE `administradores` (
  `administradorId` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(765) DEFAULT NULL,
  `login` varchar(765) DEFAULT NULL,
  `password` varchar(765) DEFAULT NULL,
  `email` varchar(765) DEFAULT NULL,
  `nivel` int(11) DEFAULT '0',
  PRIMARY KEY (`administradorId`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

/*Data for the table `administradores` */

insert  into `administradores`(`administradorId`,`nombre`,`login`,`password`,`email`,`nivel`) values (2,'Vigilante','vigilante','vigilante','vig@gmail.com',2),(4,'Administrador Principal','admin','admin','adm@gh.com',0),(5,'Jefe de equipo','jefe','jefe','juan@gmail.com',1);

/*Table structure for table `descargas` */

DROP TABLE IF EXISTS `descargas`;

CREATE TABLE `descargas` (
  `descargaId` int(11) NOT NULL AUTO_INCREMENT,
  `nterminal` varchar(255) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `hora` time DEFAULT NULL,
  `resultado` text,
  PRIMARY KEY (`descargaId`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8;

/*Data for the table `descargas` */

insert  into `descargas`(`descargaId`,`nterminal`,`fecha`,`hora`,`resultado`) values (78,'112339','2015-10-29','16:31:55','CARGA SIMPLE TERMINAL []'),(79,'112339','2015-10-29','16:36:21','CARGA SIMPLE TERMINAL []');

/*Table structure for table `descargas_lineas` */

DROP TABLE IF EXISTS `descargas_lineas`;

CREATE TABLE `descargas_lineas` (
  `descargaLineaId` int(11) NOT NULL AUTO_INCREMENT,
  `descargaId` int(11) DEFAULT NULL,
  `tag` varchar(255) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `hora` time DEFAULT NULL,
  `tipo` varchar(255) DEFAULT NULL,
  `tipoId` int(11) DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`descargaLineaId`)
) ENGINE=InnoDB AUTO_INCREMENT=3617 DEFAULT CHARSET=utf8;

/*Data for the table `descargas_lineas` */

insert  into `descargas_lineas`(`descargaLineaId`,`descargaId`,`tag`,`fecha`,`hora`,`tipo`,`tipoId`,`nombre`) values (3609,78,'0004049464','2015-10-29','16:31:30','VIGILANTE',7,'Pedro Martinez'),(3610,78,'0406220547','2015-10-29','16:31:32','RONDA',14,'R-03-F'),(3611,78,'0406215258','2015-10-29','16:31:33','PUNTO',5,'Control 1'),(3612,78,'0406209033','2015-10-29','16:31:35','PUNTO',7,'Control 3'),(3613,79,'0004049464','2015-10-29','16:36:07','VIGILANTE',7,'Pedro Martinez'),(3614,79,'0406220547','2015-10-29','16:36:09','RONDA',14,'R-03-F'),(3615,79,'0406215258','2015-10-29','16:36:11','PUNTO',5,'Control 1'),(3616,79,'0406209033','2015-10-29','16:36:13','PUNTO',7,'Control 3');

/*Table structure for table `edificios` */

DROP TABLE IF EXISTS `edificios`;

CREATE TABLE `edificios` (
  `edificioId` int(11) NOT NULL AUTO_INCREMENT,
  `grupoId` int(11) DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`edificioId`),
  KEY `ref_grupo` (`grupoId`),
  CONSTRAINT `ref_grupo` FOREIGN KEY (`grupoId`) REFERENCES `grupos` (`grupoId`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

/*Data for the table `edificios` */

insert  into `edificios`(`edificioId`,`grupoId`,`nombre`) values (6,5,'Edificio principal');

/*Table structure for table `grupos` */

DROP TABLE IF EXISTS `grupos`;

CREATE TABLE `grupos` (
  `grupoId` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`grupoId`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

/*Data for the table `grupos` */

insert  into `grupos`(`grupoId`,`nombre`) values (5,'GRUPO 1');

/*Table structure for table `puntos` */

DROP TABLE IF EXISTS `puntos`;

CREATE TABLE `puntos` (
  `puntoId` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `edificioId` int(11) DEFAULT NULL,
  `tag` varchar(255) DEFAULT NULL,
  `cota` varchar(255) DEFAULT NULL,
  `cubiculo` varchar(255) DEFAULT NULL,
  `observaciones` text,
  PRIMARY KEY (`puntoId`),
  UNIQUE KEY `idx_tag` (`tag`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;

/*Data for the table `puntos` */

insert  into `puntos`(`puntoId`,`nombre`,`edificioId`,`tag`,`cota`,`cubiculo`,`observaciones`) values (5,'Control 1',6,'0406215258','C1','CB1','Primer punto'),(6,'Control 2',6,'0406219258','C1','CB2','Segundo punto'),(7,'Control 3',6,'0406209033','C1','CB3','Tercer punto'),(8,'Punto Flotante',6,'0403669508','CF','CBF','El punto que flota');

/*Table structure for table `rondas` */

DROP TABLE IF EXISTS `rondas`;

CREATE TABLE `rondas` (
  `rondaId` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `tag` varchar(255) DEFAULT NULL,
  `tagf` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`rondaId`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;

/*Data for the table `rondas` */

insert  into `rondas`(`rondaId`,`nombre`,`tag`,`tagf`) values (13,'Ronda 01-02','0406213943',NULL),(14,'R-03-F','0406220547',NULL);

/*Table structure for table `rondas_realizadas` */

DROP TABLE IF EXISTS `rondas_realizadas`;

CREATE TABLE `rondas_realizadas` (
  `rondaRealizadaId` int(11) NOT NULL AUTO_INCREMENT,
  `rondaId` int(11) DEFAULT NULL,
  `terminalId` int(11) DEFAULT NULL,
  `vigilanteId` int(11) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `hora` time DEFAULT NULL,
  `resultado` text,
  `validada` tinyint(1) DEFAULT '0',
  `obsvalida` text,
  PRIMARY KEY (`rondaRealizadaId`),
  KEY `ref_ronda2` (`rondaId`),
  KEY `ref_vigilante` (`vigilanteId`),
  KEY `ref_terminal` (`terminalId`),
  CONSTRAINT `ref_ronda2` FOREIGN KEY (`rondaId`) REFERENCES `rondas` (`rondaId`),
  CONSTRAINT `ref_terminal` FOREIGN KEY (`terminalId`) REFERENCES `terminales` (`terminalId`),
  CONSTRAINT `ref_vigilante` FOREIGN KEY (`vigilanteId`) REFERENCES `vigilantes` (`vigilanteId`)
) ENGINE=InnoDB AUTO_INCREMENT=173 DEFAULT CHARSET=utf8;

/*Data for the table `rondas_realizadas` */

insert  into `rondas_realizadas`(`rondaRealizadaId`,`rondaId`,`terminalId`,`vigilanteId`,`fecha`,`hora`,`resultado`,`validada`,`obsvalida`) values (171,14,1,7,'2015-10-29','16:31:32','PUNTOS SIN CONTROLAR',1,'VALIDACION AUTOMÁTICA'),(172,14,1,7,'2015-10-29','16:36:09','PUNTOS SIN CONTROLAR',0,'');

/*Table structure for table `rondas_realizadaspuntos` */

DROP TABLE IF EXISTS `rondas_realizadaspuntos`;

CREATE TABLE `rondas_realizadaspuntos` (
  `rondaRealizadaPuntoId` int(11) NOT NULL AUTO_INCREMENT,
  `rondaRealizadaId` int(11) DEFAULT NULL,
  `orden` int(1) DEFAULT NULL,
  `puntoId` int(11) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `hora` time DEFAULT NULL,
  `tagleido` varchar(255) DEFAULT NULL,
  `ordenleido` int(11) DEFAULT NULL,
  `resultado` text,
  `nombre` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`rondaRealizadaPuntoId`),
  KEY `ref_rondaRealizada` (`rondaRealizadaId`),
  KEY `ref_punto2` (`puntoId`),
  CONSTRAINT `ref_punto2` FOREIGN KEY (`puntoId`) REFERENCES `puntos` (`puntoId`),
  CONSTRAINT `ref_rondaRealizada` FOREIGN KEY (`rondaRealizadaId`) REFERENCES `rondas_realizadas` (`rondaRealizadaId`)
) ENGINE=InnoDB AUTO_INCREMENT=437 DEFAULT CHARSET=utf8;

/*Data for the table `rondas_realizadaspuntos` */

insert  into `rondas_realizadaspuntos`(`rondaRealizadaPuntoId`,`rondaRealizadaId`,`orden`,`puntoId`,`fecha`,`hora`,`tagleido`,`ordenleido`,`resultado`,`nombre`) values (431,171,1,5,'2015-10-29','16:31:33','0406215258',1,'CORRECTO','Control 1'),(432,171,2,6,NULL,NULL,NULL,NULL,'NO LEIDO',NULL),(433,171,3,7,'2015-10-29','16:31:35','0406209033',2,'FUERA DE SECUENCIA','Control 3'),(434,172,1,5,'2015-10-29','16:36:11','0406215258',1,'CORRECTO','Control 1'),(435,172,2,6,NULL,NULL,NULL,NULL,'NO LEIDO',NULL),(436,172,3,7,'2015-10-29','16:36:13','0406209033',2,'FUERA DE SECUENCIA','Control 3');

/*Table structure for table `rondaspuntos` */

DROP TABLE IF EXISTS `rondaspuntos`;

CREATE TABLE `rondaspuntos` (
  `rondaPuntoId` int(11) NOT NULL AUTO_INCREMENT,
  `orden` int(11) DEFAULT NULL,
  `rondaId` int(11) DEFAULT NULL,
  `puntoId` int(11) DEFAULT NULL,
  PRIMARY KEY (`rondaPuntoId`),
  KEY `ref_ronda` (`rondaId`),
  KEY `ref_punto` (`puntoId`),
  CONSTRAINT `ref_punto` FOREIGN KEY (`puntoId`) REFERENCES `puntos` (`puntoId`),
  CONSTRAINT `ref_ronda` FOREIGN KEY (`rondaId`) REFERENCES `rondas` (`rondaId`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8;

/*Data for the table `rondaspuntos` */

insert  into `rondaspuntos`(`rondaPuntoId`,`orden`,`rondaId`,`puntoId`) values (21,1,13,5),(22,2,13,6),(35,1,14,5),(36,2,14,6),(37,3,14,7);

/*Table structure for table `terminales` */

DROP TABLE IF EXISTS `terminales`;

CREATE TABLE `terminales` (
  `terminalId` int(11) NOT NULL AUTO_INCREMENT,
  `numero` varchar(255) DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `fechaAlta` date DEFAULT NULL,
  `fechaBaja` date DEFAULT NULL,
  `observaciones` text,
  PRIMARY KEY (`terminalId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

/*Data for the table `terminales` */

insert  into `terminales`(`terminalId`,`numero`,`nombre`,`fechaAlta`,`fechaBaja`,`observaciones`) values (1,'112339','BONITO 112339','2015-10-20','2015-10-20','Observaciones de este terminal algo más amplias');

/*Table structure for table `vigilantes` */

DROP TABLE IF EXISTS `vigilantes`;

CREATE TABLE `vigilantes` (
  `vigilanteId` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `tag` varchar(255) DEFAULT NULL,
  `tagf` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`vigilanteId`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;

/*Data for the table `vigilantes` */

insert  into `vigilantes`(`vigilanteId`,`nombre`,`tag`,`tagf`) values (6,'Fernando Colomo','0004044154',NULL),(7,'Pedro Martinez','0004049464',NULL);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
