import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  StyleSheet,
} from 'react-native';
import {Svg, Circle} from 'react-native-svg';
import Sound from 'react-native-sound';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const App = () => {
  const [timeLeft, setTimeLeft] = useState(60);
  const scale1 = useRef(new Animated.Value(1)).current;
  const opacity1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const opacity2 = useRef(new Animated.Value(1)).current;
  const [breathText, setBreathText] = useState('Inhale');
  const [isPlaying, setIsPlaying] = useState(true);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    if (timeLeft === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const animateBreathing = () => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scale1, {
            toValue: 2.5,
            duration: 4000, // 4 sec inhale
            useNativeDriver: true,
          }),
          Animated.timing(scale1, {
            toValue: 1,
            duration: 4000, // 4 sec exhale
            useNativeDriver: true,
          }),
        ]),
      );

      animation.start();

      let interval = setInterval(() => {
        setBreathText(prev => (prev === 'Inhale' ? 'Exhale' : 'Inhale'));
      }, 4000); // Change text every 4 seconds (sync with animation)

      return () => {
        animation.stop();
        clearInterval(interval);
      };
    };

    animateBreathing();
  }, []);

  useEffect(() => {
    const breathingMusic = new Sound(require('./water.mp3'), error => {
      if (error) {
        console.log('Error loading sound:', error);
        return;
      }
      breathingMusic.play(() => breathingMusic.release());
    });
    setSound(breathingMusic);

    return () => {
      breathingMusic.stop(() => breathingMusic.release());
    };
  }, []);

  const toggleMusic = () => {
    if (sound) {
      if (isPlaying) {
        sound.pause();
      } else {
        sound.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton}>
        <Text style={styles.closeText}>✖</Text>
      </TouchableOpacity>

      <Text style={styles.timerText}>{`0:${
        timeLeft < 10 ? `0${timeLeft}` : timeLeft
      }`}</Text>

      <View style={styles.breathingContainer}>
        <Svg height="350" width="350" viewBox="0 0 100 100">
          <AnimatedCircle
            cx="50"
            cy="50"
            strokeWidth="1"
            stroke="rgba(255,255,255,0.5)"
            fill="transparent"
            r={scale1.interpolate({
              inputRange: [1, 2.5],
              outputRange: [20, 50],
            })}
            // opacity={}
          />
          <AnimatedCircle
            cx="50"
            cy="50"
            strokeWidth="2"
            stroke="rgba(255,255,255,0.7)"
            fill="transparent"
            r="49"
          />
        </Svg>

        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/512/3064/3064197.png',
          }}
          style={styles.icon}
        />
      </View>

      <Text style={styles.breathText}>{breathText}</Text>

      <View style={styles.controls}>
        <TouchableOpacity onPress={toggleMusic}>
          <Text style={styles.controlText}>{isPlaying ? '🔊' : '🔇'}</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.controlText}>📳</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B3E5DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {position: 'absolute', top: 20, left: 20, borderRadius: 50},
  closeText: {fontSize: 20, color: 'black'},
  timerText: {position: 'absolute', top: 20, fontSize: 20, color: 'white'},
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 400,
    height: 400,
    position: 'relative',
  },
  icon: {position: 'absolute', width: 50, height: 50},
  breathText: {
    fontSize: 30,
    color: 'white',
    marginTop: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 40,
    width: '80%',
  },
  controlText: {fontSize: 40},
});

export default App;
