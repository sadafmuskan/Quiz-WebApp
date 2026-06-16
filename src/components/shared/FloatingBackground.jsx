const ITEMS = [
  { icon: '📚', top: '8%',  left: '4%',  size: 34, delay: '0s',   dur: '7s'  },
  { icon: '✏️', top: '20%', left: '90%', size: 28, delay: '1.2s', dur: '9s'  },
  { icon: '📝', top: '58%', left: '2%',  size: 30, delay: '2.4s', dur: '8s'  },
  { icon: '📓', top: '78%', left: '87%', size: 32, delay: '0.6s', dur: '10s' },
  { icon: '📐', top: '42%', left: '93%', size: 24, delay: '3.2s', dur: '7s'  },
  { icon: '📖', top: '66%', left: '47%', size: 36, delay: '1.8s', dur: '9s'  },
  { icon: '🖊️', top: '12%', left: '70%', size: 26, delay: '2.8s', dur: '6s'  },
  { icon: '📌', top: '32%', left: '17%', size: 28, delay: '4.2s', dur: '11s' },
  { icon: '🎓', top: '52%', left: '68%', size: 38, delay: '0.4s', dur: '8s'  },
  { icon: '📋', top: '85%', left: '11%', size: 24, delay: '3.8s', dur: '7s'  },
  { icon: '📏', top: '4%',  left: '37%', size: 30, delay: '2.2s', dur: '9s'  },
  { icon: '🔖', top: '72%', left: '31%', size: 26, delay: '4.8s', dur: '6s'  },
  { icon: '📚', top: '44%', left: '58%', size: 22, delay: '1.6s', dur: '10s' },
  { icon: '✏️', top: '90%', left: '54%', size: 20, delay: '5.2s', dur: '8s'  },
  { icon: '📝', top: '17%', left: '24%', size: 18, delay: '3.6s', dur: '7s'  },
  { icon: '📓', top: '30%', left: '78%', size: 20, delay: '6.1s', dur: '9s'  },
  { icon: '🎒', top: '94%', left: '73%', size: 32, delay: '0.9s', dur: '8s'  },
  { icon: '📖', top: '3%',  left: '57%', size: 22, delay: '5.5s', dur: '10s' },
];

export default function FloatingBackground({ dark = false, fixed = false }) {
  const opacity = dark ? 0.18 : 0.065;
  return (
    <div className={`edu-bg${fixed ? ' edu-bg-fixed' : ''}`} aria-hidden="true">
      {ITEMS.map((item, i) => (
        <span
          key={i}
          className="edu-float"
          style={{
            top: item.top,
            left: item.left,
            fontSize: item.size,
            opacity,
            animationDelay: item.delay,
            animationDuration: item.dur,
          }}
        >
          {item.icon}
        </span>
      ))}
    </div>
  );
}
