angular.module('appSLM', ['ui.router'])
	.config(function($stateProvider, $urlRouterProvider, $sceDelegateProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'views/login.html',
                controller: 'ctrlLogin'
            })
            .state('results', {
                url: '/results',
                templateUrl: 'views/results.html',
                controller: 'ctrlResults'
            });
            $sceDelegateProvider.resourceUrlWhitelist([
			    'self',
			    'https://www.youtube.com/**'
			  ]);

        $urlRouterProvider.otherwise('login');
    })
    .constant('configuracionGlobal', {
    	'api_url' : 'http://localhost:3000'
    })
	.factory('comun', function(configuracionGlobal, $http) {
		var comun = {};
		comun.resultados = [];
		comun.oculta = false;
		comun.codigo = "";
		comun.twitter= {};
		comun.videos = [];

		comun.processTwitter = function(twitter) {
			return $http.get(configuracionGlobal.api_url + "/twitter?name=" + comun.twitter.username)
			.success(function(data) {
				angular.copy(data, comun.resultados);
			return comun.resultados
			})
			.fail(function(err) {
            	comun.resultados = "Algo salio mal";
        	});
		}

		comun.obtenerResultado = function(codigo) {
			return $http.get(configuracionGlobal.api_url + "/result?code=" + comun.codigo)
			.success(function(data) {
				angular.copy(data.finalResp, comun.resultados);

				for (var i=0; i < comun.resultados.length; i++){
					$http.get(configuracionGlobal.api_url + "/youtube?words=" + comun.resultados[i].cat)
						.success(function(datos) {
							angular.copy(datos, comun.videos);
							// var aux = angular.copy(datos);   //probar
							// comun.videos.push(aux);
						})
				}

				comun.videos[0] = comun.resultados[0].cat;
				
				return comun.resultados
			})
		}

		return comun;
	})
	.controller('ctrlLogin', function($scope, $state, comun) {
		$scope.twitter = {};
		$scope.twitter = comun.twitter;
		$scope.twitter.username = '';
		$scope.oculta = comun.oculta;
		$scope.codigo = "";
		$scope.datosOk = false;
		$scope.alerta1 = false;

		$scope.limpiar = function() {
			$scope.datosOk = false;
			$scope.alerta1 = false;
			$scope.twitter = {};
			$scope.codigo = ""; 
		}

		$scope.procesarTwitter = function() {
			$scope.datosOk = true;
			//$scope.twitter.username = getParameterByName ($scope.twitter.username);
			comun.processTwitter($scope.twitter);
			//$scope.tarea.nombre = '';
		}

		$scope.procesarFacebook = function() {
			//$scope.datosOk = true;
			$scope.alerta1 = true;
		}

		
		$scope.mostrarResultados = function(codigo) {
			comun.codigo = $scope.codigo;
			comun.obtenerResultado($scope.codigo);
			$scope.twitter.username = '';
			$state.go('results');
		}


		getParameterByName = function(name) {
    		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    			results = regex.exec(location.search);
    		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    	}
	})
	.controller('ctrlResults', function($scope, $state, comun, configuracionGlobal, $http) {
		$scope.twitter = {};
		$scope.twitter = comun.twitter;
		$scope.codigo = comun.codigo;
		$scope.resultados = comun.resultados;
		$scope.videos = comun.videos;

		$scope.masPrioridad	= function(_resultado) {
			_resultado.ocultar = true;
		}

		$scope.menosPrioridad	= function(_resultado) {
			_resultado.ocultar = true;
		}
		
		$scope.getIframeSrc = function(src) {
  			return 'https://www.youtube.com/embed/' + src;
		}
	})