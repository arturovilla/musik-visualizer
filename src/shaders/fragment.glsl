precision mediump float;
uniform float uTime;
uniform float uLowPass;

// getting data from vertex shader
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float vDisplacement;
// 



// vec3 palette(float t){
//     vec3 a = vec3(0.500, 0.500, 0.500);
//     vec3 b = vec3(0.500, 0.500, 0.500);
//     vec3 c = vec3(0.800, 0.800, 0.500);
//     vec3 d = vec3(0.000, 0.200, 0.500);

//     return (a) + b*sin( 6.28318*(c*t+d) ) ;

// }

vec3 palette3(float t){
    vec3 a = vec3(0.500, 0.500, 0.500);
    vec3 b = vec3(0.980, 0.980, 0.980);
    vec3 c = vec3(.9000 ,0.9000 ,0.900);
    vec3 d = vec3(0.348, 0.512, 0.675);

    return (a ) + b*sin( (uLowPass+1.0)*(c*t+d) ) ;

}

vec3 palette2(float t){
    // float scaledPass = abs(sin(uLowPass));
    

    vec3 a = vec3(0.500, 0.500, 0.500);
    vec3 b = vec3(0.500, 0.500, 0.500);
    vec3 c = vec3(0.800, 0.800, 0.500);
    vec3 d = vec3(0.000, 0.200, 0.500);

    return (a) + b*sin( uLowPass*(c*t+d) ) ;

}

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {
	

	// gl_FragColor = vec4(palette(map(vDisplacement, 0.01, 0.5, 0.01, 0.9)), 1.0);
  gl_FragColor = vec4(palette2(map(vDisplacement, 0.01, 0.5, 0.01, 0.9)), 1.0);
  
}

