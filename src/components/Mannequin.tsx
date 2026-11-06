import React, { useEffect, useId, useRef, useState } from 'react';
import { MannequinPoseType } from '../types';

interface Joint2D {
  pelvis: [number, number];
  chest: [number, number];
  head: [number, number];
  // Near limbs (front)
  nearShoulder: [number, number];
  nearElbow: [number, number];
  nearWrist: [number, number];
  nearHip: [number, number];
  nearKnee: [number, number];
  nearAnkle: [number, number];
  nearToe: [number, number];
  // Far limbs (back / depth)
  farShoulder: [number, number];
  farElbow: [number, number];
  farWrist: [number, number];
  farHip: [number, number];
  farKnee: [number, number];
  farAnkle: [number, number];
  farToe: [number, number];
}

interface PoseDef {
  durationMs: number;
  frames: [Joint2D, Joint2D];
  hasChair?: boolean;
  hasWall?: boolean;
}

// Coordinate baseline: Pelvis at around (200, 150). Ground target is y = 250.
export const POSE_LIBRARY: Record<MannequinPoseType, PoseDef> = {
  // 1. Pompes classiques (Pushup)
  pushup: {
    durationMs: 2200,
    frames: [
      // Haut (bras tendus, corps rectiligne)
      {
        pelvis: [175, 175],
        chest: [245, 160],
        head: [270, 145],
        nearShoulder: [245, 160],
        nearElbow: [245, 205],
        nearWrist: [245, 250],
        nearHip: [175, 175],
        nearKnee: [120, 210],
        nearAnkle: [70, 245],
        nearToe: [55, 250],
        farShoulder: [240, 156],
        farElbow: [240, 201],
        farWrist: [240, 250],
        farHip: [170, 171],
        farKnee: [115, 206],
        farAnkle: [65, 241],
        farToe: [50, 250],
      },
      // Bas (poitrine au sol, coudes à 90°)
      {
        pelvis: [175, 230],
        chest: [245, 225],
        head: [270, 215],
        nearShoulder: [245, 225],
        nearElbow: [215, 200],
        nearWrist: [245, 250],
        nearHip: [175, 230],
        nearKnee: [120, 240],
        nearAnkle: [70, 248],
        nearToe: [55, 250],
        farShoulder: [240, 221],
        farElbow: [210, 196],
        farWrist: [240, 250],
        farHip: [170, 226],
        farKnee: [115, 236],
        farAnkle: [65, 244],
        farToe: [50, 250],
      },
    ],
  },

  // 2. Pompes sur les genoux
  pushup_knees: {
    durationMs: 2200,
    frames: [
      {
        pelvis: [180, 185],
        chest: [245, 165],
        head: [270, 150],
        nearShoulder: [245, 165],
        nearElbow: [245, 210],
        nearWrist: [245, 250],
        nearHip: [180, 185],
        nearKnee: [130, 250],
        nearAnkle: [90, 225],
        nearToe: [80, 215],
        farShoulder: [240, 161],
        farElbow: [240, 206],
        farWrist: [240, 250],
        farHip: [175, 181],
        farKnee: [125, 250],
        farAnkle: [85, 221],
        farToe: [75, 211],
      },
      {
        pelvis: [180, 235],
        chest: [245, 225],
        head: [270, 215],
        nearShoulder: [245, 225],
        nearElbow: [215, 205],
        nearWrist: [245, 250],
        nearHip: [180, 235],
        nearKnee: [130, 250],
        nearAnkle: [90, 225],
        nearToe: [80, 215],
        farShoulder: [240, 221],
        farElbow: [210, 201],
        farWrist: [240, 250],
        farHip: [175, 231],
        farKnee: [125, 250],
        farAnkle: [85, 221],
        farToe: [75, 211],
      },
    ],
  },

  // 3. Pompes au mur (Pushup wall)
  pushup_wall: {
    durationMs: 2000,
    hasWall: true,
    frames: [
      {
        pelvis: [160, 170],
        chest: [130, 115],
        head: [115, 95],
        nearShoulder: [130, 115],
        nearElbow: [95, 115],
        nearWrist: [60, 115],
        nearHip: [160, 170],
        nearKnee: [190, 215],
        nearAnkle: [220, 250],
        nearToe: [235, 250],
        farShoulder: [125, 111],
        farElbow: [90, 111],
        farWrist: [60, 111],
        farHip: [155, 166],
        farKnee: [185, 211],
        farAnkle: [215, 250],
        farToe: [230, 250],
      },
      {
        pelvis: [135, 170],
        chest: [100, 115],
        head: [85, 95],
        nearShoulder: [100, 115],
        nearElbow: [115, 155],
        nearWrist: [60, 115],
        nearHip: [135, 170],
        nearKnee: [175, 215],
        nearAnkle: [220, 250],
        nearToe: [235, 250],
        farShoulder: [95, 111],
        farElbow: [110, 151],
        farWrist: [60, 111],
        farHip: [130, 166],
        farKnee: [170, 211],
        farAnkle: [215, 250],
        farToe: [230, 250],
      },
    ],
  },

  // 4. Pompes inclinées
  pushup_incline: {
    durationMs: 2100,
    hasChair: true,
    frames: [
      {
        pelvis: [165, 180],
        chest: [235, 140],
        head: [255, 120],
        nearShoulder: [235, 140],
        nearElbow: [235, 170],
        nearWrist: [235, 205],
        nearHip: [165, 180],
        nearKnee: [115, 215],
        nearAnkle: [65, 250],
        nearToe: [55, 250],
        farShoulder: [230, 136],
        farElbow: [230, 166],
        farWrist: [230, 205],
        farHip: [160, 176],
        farKnee: [110, 211],
        farAnkle: [60, 250],
        farToe: [50, 250],
      },
      {
        pelvis: [155, 210],
        chest: [225, 190],
        head: [245, 175],
        nearShoulder: [225, 190],
        nearElbow: [200, 175],
        nearWrist: [235, 205],
        nearHip: [155, 210],
        nearKnee: [110, 230],
        nearAnkle: [65, 250],
        nearToe: [55, 250],
        farShoulder: [220, 186],
        farElbow: [195, 171],
        farWrist: [230, 205],
        farHip: [150, 206],
        farKnee: [105, 226],
        farAnkle: [60, 250],
        farToe: [50, 250],
      },
    ],
  },

  // 5. Pompes diamant
  pushup_diamond: {
    durationMs: 2200,
    frames: [
      {
        pelvis: [175, 175],
        chest: [245, 160],
        head: [270, 145],
        nearShoulder: [245, 160],
        nearElbow: [230, 205],
        nearWrist: [220, 250],
        nearHip: [175, 175],
        nearKnee: [120, 210],
        nearAnkle: [70, 245],
        nearToe: [55, 250],
        farShoulder: [240, 156],
        farElbow: [225, 201],
        farWrist: [220, 250],
        farHip: [170, 171],
        farKnee: [115, 206],
        farAnkle: [65, 241],
        farToe: [50, 250],
      },
      {
        pelvis: [175, 230],
        chest: [245, 225],
        head: [270, 215],
        nearShoulder: [245, 225],
        nearElbow: [200, 210],
        nearWrist: [220, 250],
        nearHip: [175, 230],
        nearKnee: [120, 240],
        nearAnkle: [70, 248],
        nearToe: [55, 250],
        farShoulder: [240, 221],
        farElbow: [195, 206],
        farWrist: [220, 250],
        farHip: [170, 226],
        farKnee: [115, 236],
        farAnkle: [65, 244],
        farToe: [50, 250],
      },
    ],
  },

  // 6. Squat classique (Hanches en arrière, dos droit, talons au sol)
  squat: {
    durationMs: 2400,
    frames: [
      // Debout
      {
        pelvis: [200, 165],
        chest: [200, 110],
        head: [200, 85],
        nearShoulder: [200, 110],
        nearElbow: [225, 130],
        nearWrist: [245, 115],
        nearHip: [200, 165],
        nearKnee: [200, 210],
        nearAnkle: [200, 250],
        nearToe: [225, 250],
        farShoulder: [194, 106],
        farElbow: [219, 126],
        farWrist: [239, 111],
        farHip: [194, 161],
        farKnee: [194, 206],
        farAnkle: [194, 250],
        farToe: [219, 250],
      },
      // En bas (cuisses à 90°, hanches en arrière, talons au sol)
      {
        pelvis: [150, 205],
        chest: [220, 160],
        head: [225, 135],
        nearShoulder: [220, 160],
        nearElbow: [250, 155],
        nearWrist: [275, 145],
        nearHip: [150, 205],
        nearKnee: [215, 205],
        nearAnkle: [200, 250],
        nearToe: [225, 250],
        farShoulder: [214, 156],
        farElbow: [244, 151],
        farWrist: [269, 141],
        farHip: [144, 201],
        farKnee: [209, 201],
        farAnkle: [194, 250],
        farToe: [219, 250],
      },
    ],
  },

  squat_deep: {
    durationMs: 2500,
    frames: [
      {
        pelvis: [200, 165],
        chest: [200, 110],
        head: [200, 85],
        nearShoulder: [200, 110],
        nearElbow: [225, 130],
        nearWrist: [245, 115],
        nearHip: [200, 165],
        nearKnee: [200, 210],
        nearAnkle: [200, 250],
        nearToe: [225, 250],
        farShoulder: [194, 106],
        farElbow: [219, 126],
        farWrist: [239, 111],
        farHip: [194, 161],
        farKnee: [194, 206],
        farAnkle: [194, 250],
        farToe: [219, 250],
      },
      {
        pelvis: [140, 225],
        chest: [220, 180],
        head: [225, 155],
        nearShoulder: [220, 180],
        nearElbow: [255, 170],
        nearWrist: [280, 160],
        nearHip: [140, 225],
        nearKnee: [215, 215],
        nearAnkle: [200, 250],
        nearToe: [225, 250],
        farShoulder: [214, 176],
        farElbow: [249, 166],
        farWrist: [274, 156],
        farHip: [134, 221],
        farKnee: [209, 211],
        farAnkle: [194, 250],
        farToe: [219, 250],
      },
    ],
  },

  squat_chair: {
    durationMs: 2400,
    hasChair: true,
    frames: [
      {
        pelvis: [210, 165],
        chest: [210, 110],
        head: [210, 85],
        nearShoulder: [210, 110],
        nearElbow: [235, 130],
        nearWrist: [255, 115],
        nearHip: [210, 165],
        nearKnee: [210, 210],
        nearAnkle: [210, 250],
        nearToe: [235, 250],
        farShoulder: [204, 106],
        farElbow: [229, 126],
        farWrist: [249, 111],
        farHip: [204, 161],
        farKnee: [204, 206],
        farAnkle: [204, 250],
        farToe: [229, 250],
      },
      {
        pelvis: [160, 205],
        chest: [225, 160],
        head: [230, 135],
        nearShoulder: [225, 160],
        nearElbow: [255, 155],
        nearWrist: [280, 145],
        nearHip: [160, 205],
        nearKnee: [215, 205],
        nearAnkle: [205, 250],
        nearToe: [235, 250],
        farShoulder: [219, 156],
        farElbow: [249, 151],
        farWrist: [274, 141],
        farHip: [154, 201],
        farKnee: [209, 201],
        farAnkle: [199, 250],
        farToe: [229, 250],
      },
    ],
  },

  squat_jump: {
    durationMs: 1800,
    frames: [
      {
        pelvis: [150, 210],
        chest: [220, 165],
        head: [225, 140],
        nearShoulder: [220, 165],
        nearElbow: [200, 195],
        nearWrist: [180, 220],
        nearHip: [150, 210],
        nearKnee: [215, 210],
        nearAnkle: [200, 250],
        nearToe: [225, 250],
        farShoulder: [214, 161],
        farElbow: [194, 191],
        farWrist: [174, 216],
        farHip: [144, 206],
        farKnee: [209, 206],
        farAnkle: [194, 250],
        farToe: [219, 250],
      },
      {
        pelvis: [200, 130],
        chest: [200, 75],
        head: [200, 50],
        nearShoulder: [200, 75],
        nearElbow: [205, 115],
        nearWrist: [210, 150],
        nearHip: [200, 130],
        nearKnee: [200, 175],
        nearAnkle: [200, 220],
        nearToe: [205, 235],
        farShoulder: [194, 71],
        farElbow: [199, 111],
        farWrist: [204, 146],
        farHip: [194, 126],
        farKnee: [194, 171],
        farAnkle: [194, 220],
        farToe: [199, 235],
      },
    ],
  },

  // 7. Chaise au mur (Wall sit)
  wall_sit: {
    durationMs: 3000,
    hasWall: true,
    frames: [
      {
        pelvis: [95, 205],
        chest: [90, 145],
        head: [90, 120],
        nearShoulder: [90, 145],
        nearElbow: [120, 165],
        nearWrist: [145, 180],
        nearHip: [95, 205],
        nearKnee: [165, 205],
        nearAnkle: [165, 250],
        nearToe: [195, 250],
        farShoulder: [85, 141],
        farElbow: [115, 161],
        farWrist: [140, 176],
        farHip: [90, 201],
        farKnee: [160, 201],
        farAnkle: [160, 250],
        farToe: [190, 250],
      },
      {
        pelvis: [95, 206],
        chest: [92, 147],
        head: [92, 122],
        nearShoulder: [92, 147],
        nearElbow: [122, 167],
        nearWrist: [147, 182],
        nearHip: [95, 206],
        nearKnee: [165, 206],
        nearAnkle: [165, 250],
        nearToe: [195, 250],
        farShoulder: [87, 143],
        farElbow: [117, 163],
        farWrist: [142, 178],
        farHip: [90, 202],
        farKnee: [160, 202],
        farAnkle: [160, 250],
        farToe: [190, 250],
      },
    ],
  },

  // 8. Fentes (Lunge) - Genou arrière proche du sol
  lunge: {
    durationMs: 2400,
    frames: [
      {
        pelvis: [195, 165],
        chest: [195, 110],
        head: [195, 85],
        nearShoulder: [195, 110],
        nearElbow: [180, 140],
        nearWrist: [195, 170],
        nearHip: [195, 165],
        nearKnee: [200, 210],
        nearAnkle: [200, 250],
        nearToe: [225, 250],
        farShoulder: [189, 106],
        farElbow: [174, 136],
        farWrist: [189, 166],
        farHip: [189, 161],
        farKnee: [194, 206],
        farAnkle: [194, 250],
        farToe: [219, 250],
      },
      {
        pelvis: [195, 200],
        chest: [195, 145],
        head: [195, 120],
        nearShoulder: [195, 145],
        nearElbow: [180, 175],
        nearWrist: [195, 205],
        nearHip: [195, 200],
        nearKnee: [255, 205],
        nearAnkle: [255, 250],
        nearToe: [280, 250],
        farShoulder: [189, 141],
        farElbow: [174, 171],
        farWrist: [189, 201],
        farHip: [189, 196],
        farKnee: [140, 246],
        farAnkle: [115, 248],
        farToe: [105, 250],
      },
    ],
  },

  lunge_reverse: {
    durationMs: 2400,
    frames: [
      {
        pelvis: [215, 165],
        chest: [215, 110],
        head: [215, 85],
        nearShoulder: [215, 110],
        nearElbow: [205, 140],
        nearWrist: [215, 170],
        nearHip: [215, 165],
        nearKnee: [215, 210],
        nearAnkle: [215, 250],
        nearToe: [240, 250],
        farShoulder: [209, 106],
        farElbow: [199, 136],
        farWrist: [209, 166],
        farHip: [209, 161],
        farKnee: [209, 206],
        farAnkle: [209, 250],
        farToe: [234, 250],
      },
      {
        pelvis: [215, 200],
        chest: [215, 145],
        head: [215, 120],
        nearShoulder: [215, 145],
        nearElbow: [230, 175],
        nearWrist: [245, 195],
        nearHip: [215, 200],
        nearKnee: [225, 205],
        nearAnkle: [220, 250],
        nearToe: [245, 250],
        farShoulder: [209, 141],
        farElbow: [224, 171],
        farWrist: [239, 191],
        farHip: [209, 196],
        farKnee: [155, 246],
        farAnkle: [125, 248],
        farToe: [115, 250],
      },
    ],
  },

  // 9. Crunchs au sol (dos au sol)
  crunch: {
    durationMs: 2200,
    frames: [
      // Allongé au sol
      {
        pelvis: [190, 245],
        chest: [140, 245],
        head: [100, 240],
        nearShoulder: [140, 245],
        nearElbow: [115, 220],
        nearWrist: [125, 230],
        nearHip: [190, 245],
        nearKnee: [245, 195],
        nearAnkle: [290, 250],
        nearToe: [310, 250],
        farShoulder: [135, 241],
        farElbow: [110, 216],
        farWrist: [120, 226],
        farHip: [185, 241],
        farKnee: [240, 191],
        farAnkle: [285, 250],
        farToe: [305, 250],
      },
      // Enroulé en contraction
      {
        pelvis: [190, 245],
        chest: [155, 225],
        head: [125, 195],
        nearShoulder: [155, 225],
        nearElbow: [135, 190],
        nearWrist: [150, 200],
        nearHip: [190, 245],
        nearKnee: [245, 195],
        nearAnkle: [290, 250],
        nearToe: [310, 250],
        farShoulder: [150, 221],
        farElbow: [130, 186],
        farWrist: [145, 196],
        farHip: [185, 241],
        farKnee: [240, 191],
        farAnkle: [285, 250],
        farToe: [305, 250],
      },
    ],
  },

  crunch_bicycle: {
    durationMs: 2000,
    frames: [
      {
        pelvis: [190, 245],
        chest: [155, 225],
        head: [125, 200],
        nearShoulder: [155, 225],
        nearElbow: [175, 195],
        nearWrist: [155, 200],
        nearHip: [190, 245],
        nearKnee: [215, 180],
        nearAnkle: [235, 140],
        nearToe: [250, 140],
        farShoulder: [150, 221],
        farElbow: [145, 205],
        farWrist: [155, 200],
        farHip: [185, 241],
        farKnee: [270, 235],
        farAnkle: [320, 242],
        farToe: [335, 242],
      },
      {
        pelvis: [190, 245],
        chest: [155, 225],
        head: [125, 200],
        nearShoulder: [155, 225],
        nearElbow: [145, 205],
        nearWrist: [155, 200],
        nearHip: [190, 245],
        nearKnee: [270, 235],
        nearAnkle: [320, 242],
        nearToe: [335, 242],
        farShoulder: [150, 221],
        farElbow: [175, 195],
        farWrist: [155, 200],
        farHip: [185, 241],
        farKnee: [215, 180],
        farAnkle: [235, 140],
        farToe: [250, 140],
      },
    ],
  },

  // 10. Planche ventrale (avant-bras au sol, corps rigide)
  plank: {
    durationMs: 2600,
    frames: [
      {
        pelvis: [180, 195],
        chest: [245, 190],
        head: [275, 175],
        nearShoulder: [245, 190],
        nearElbow: [245, 250],
        nearWrist: [275, 250],
        nearHip: [180, 195],
        nearKnee: [125, 225],
        nearAnkle: [75, 248],
        nearToe: [60, 250],
        farShoulder: [240, 186],
        farElbow: [240, 250],
        farWrist: [270, 250],
        farHip: [175, 191],
        farKnee: [120, 221],
        farAnkle: [70, 244],
        farToe: [55, 250],
      },
      {
        pelvis: [180, 192],
        chest: [245, 187],
        head: [275, 172],
        nearShoulder: [245, 187],
        nearElbow: [245, 250],
        nearWrist: [275, 250],
        nearHip: [180, 192],
        nearKnee: [125, 222],
        nearAnkle: [75, 248],
        nearToe: [60, 250],
        farShoulder: [240, 183],
        farElbow: [240, 250],
        farWrist: [270, 250],
        farHip: [175, 188],
        farKnee: [120, 218],
        farAnkle: [70, 244],
        farToe: [55, 250],
      },
    ],
  },

  plank_knees: {
    durationMs: 2600,
    frames: [
      {
        pelvis: [190, 210],
        chest: [245, 195],
        head: [275, 180],
        nearShoulder: [245, 195],
        nearElbow: [245, 250],
        nearWrist: [275, 250],
        nearHip: [190, 210],
        nearKnee: [135, 250],
        nearAnkle: [95, 225],
        nearToe: [85, 215],
        farShoulder: [240, 191],
        farElbow: [240, 250],
        farWrist: [270, 250],
        farHip: [185, 206],
        farKnee: [130, 250],
        farAnkle: [90, 221],
        farToe: [80, 211],
      },
      {
        pelvis: [190, 208],
        chest: [245, 193],
        head: [275, 178],
        nearShoulder: [245, 193],
        nearElbow: [245, 250],
        nearWrist: [275, 250],
        nearHip: [190, 208],
        nearKnee: [135, 250],
        nearAnkle: [95, 225],
        nearToe: [85, 215],
        farShoulder: [240, 189],
        farElbow: [240, 250],
        farWrist: [270, 250],
        farHip: [185, 204],
        farKnee: [130, 250],
        farAnkle: [90, 221],
        farToe: [80, 211],
      },
    ],
  },

  side_plank: {
    durationMs: 2400,
    frames: [
      {
        pelvis: [180, 205],
        chest: [235, 170],
        head: [265, 145],
        nearShoulder: [235, 170],
        nearElbow: [235, 250],
        nearWrist: [265, 250],
        nearHip: [180, 205],
        nearKnee: [125, 230],
        nearAnkle: [75, 250],
        nearToe: [60, 250],
        farShoulder: [230, 166],
        farElbow: [230, 250],
        farWrist: [260, 250],
        farHip: [175, 201],
        farKnee: [120, 226],
        farAnkle: [70, 250],
        farToe: [55, 250],
      },
      {
        pelvis: [180, 198],
        chest: [235, 168],
        head: [265, 143],
        nearShoulder: [235, 168],
        nearElbow: [235, 250],
        nearWrist: [265, 250],
        nearHip: [180, 198],
        nearKnee: [125, 228],
        nearAnkle: [75, 250],
        nearToe: [60, 250],
        farShoulder: [230, 164],
        farElbow: [230, 250],
        farWrist: [260, 250],
        farHip: [175, 194],
        farKnee: [120, 224],
        farAnkle: [70, 250],
        farToe: [55, 250],
      },
    ],
  },

  // 11. Pont fessier (Glute bridge)
  glute_bridge: {
    durationMs: 2200,
    frames: [
      {
        pelvis: [180, 248],
        chest: [130, 248],
        head: [100, 245],
        nearShoulder: [130, 248],
        nearElbow: [155, 250],
        nearWrist: [180, 250],
        nearHip: [180, 248],
        nearKnee: [240, 200],
        nearAnkle: [270, 250],
        nearToe: [295, 250],
        farShoulder: [125, 244],
        farElbow: [150, 250],
        farWrist: [175, 250],
        farHip: [175, 244],
        farKnee: [235, 196],
        farAnkle: [265, 250],
        farToe: [290, 250],
      },
      {
        pelvis: [190, 185],
        chest: [130, 248],
        head: [100, 245],
        nearShoulder: [130, 248],
        nearElbow: [155, 250],
        nearWrist: [180, 250],
        nearHip: [190, 185],
        nearKnee: [240, 195],
        nearAnkle: [270, 250],
        nearToe: [295, 250],
        farShoulder: [125, 244],
        farElbow: [150, 250],
        farWrist: [175, 250],
        farHip: [185, 181],
        farKnee: [235, 191],
        farAnkle: [265, 250],
        farToe: [290, 250],
      },
    ],
  },

  glute_bridge_single: {
    durationMs: 2200,
    frames: [
      {
        pelvis: [180, 248],
        chest: [130, 248],
        head: [100, 245],
        nearShoulder: [130, 248],
        nearElbow: [155, 250],
        nearWrist: [180, 250],
        nearHip: [180, 248],
        nearKnee: [240, 200],
        nearAnkle: [270, 250],
        nearToe: [295, 250],
        farShoulder: [125, 244],
        farElbow: [150, 250],
        farWrist: [175, 250],
        farHip: [175, 244],
        farKnee: [225, 210],
        farAnkle: [265, 180],
        farToe: [280, 175],
      },
      {
        pelvis: [190, 185],
        chest: [130, 248],
        head: [100, 245],
        nearShoulder: [130, 248],
        nearElbow: [155, 250],
        nearWrist: [180, 250],
        nearHip: [190, 185],
        nearKnee: [240, 195],
        nearAnkle: [270, 250],
        nearToe: [295, 250],
        farShoulder: [125, 244],
        farElbow: [150, 250],
        farWrist: [175, 250],
        farHip: [185, 181],
        farKnee: [225, 175],
        farAnkle: [275, 145],
        farToe: [290, 140],
      },
    ],
  },

  // 12. Dips sur chaise (mains sur la chaise dessinée)
  dips_chair: {
    durationMs: 2200,
    hasChair: true,
    frames: [
      {
        pelvis: [205, 200],
        chest: [205, 145],
        head: [205, 120],
        nearShoulder: [205, 145],
        nearElbow: [185, 175],
        nearWrist: [175, 200],
        nearHip: [205, 200],
        nearKnee: [255, 200],
        nearAnkle: [255, 250],
        nearToe: [280, 250],
        farShoulder: [199, 141],
        farElbow: [179, 171],
        farWrist: [175, 200],
        farHip: [199, 196],
        farKnee: [249, 196],
        farAnkle: [249, 250],
        farToe: [274, 250],
      },
      {
        pelvis: [205, 240],
        chest: [205, 185],
        head: [205, 160],
        nearShoulder: [205, 185],
        nearElbow: [175, 185],
        nearWrist: [175, 200],
        nearHip: [205, 240],
        nearKnee: [255, 240],
        nearAnkle: [255, 250],
        nearToe: [280, 250],
        farShoulder: [199, 181],
        farElbow: [169, 181],
        farWrist: [175, 200],
        farHip: [199, 236],
        farKnee: [249, 236],
        farAnkle: [249, 250],
        farToe: [274, 250],
      },
    ],
  },

  dips_floor: {
    durationMs: 2200,
    frames: [
      {
        pelvis: [205, 205],
        chest: [180, 165],
        head: [180, 140],
        nearShoulder: [180, 165],
        nearElbow: [155, 210],
        nearWrist: [140, 250],
        nearHip: [205, 205],
        nearKnee: [255, 205],
        nearAnkle: [255, 250],
        nearToe: [280, 250],
        farShoulder: [174, 161],
        farElbow: [149, 206],
        farWrist: [135, 250],
        farHip: [199, 201],
        farKnee: [249, 201],
        farAnkle: [249, 250],
        farToe: [274, 250],
      },
      {
        pelvis: [205, 240],
        chest: [180, 195],
        head: [180, 170],
        nearShoulder: [180, 195],
        nearElbow: [150, 225],
        nearWrist: [140, 250],
        nearHip: [205, 240],
        nearKnee: [255, 240],
        nearAnkle: [255, 250],
        nearToe: [280, 250],
        farShoulder: [174, 191],
        farElbow: [144, 221],
        farWrist: [135, 250],
        farHip: [199, 236],
        farKnee: [249, 236],
        farAnkle: [249, 250],
        farToe: [274, 250],
      },
    ],
  },

  // 13. Jumping Jacks
  jumping_jacks: {
    durationMs: 1200,
    frames: [
      {
        pelvis: [200, 165],
        chest: [200, 110],
        head: [200, 85],
        nearShoulder: [200, 110],
        nearElbow: [190, 145],
        nearWrist: [190, 185],
        nearHip: [200, 165],
        nearKnee: [200, 210],
        nearAnkle: [200, 250],
        nearToe: [215, 250],
        farShoulder: [194, 106],
        farElbow: [184, 141],
        farWrist: [184, 181],
        farHip: [194, 161],
        farKnee: [194, 206],
        farAnkle: [194, 250],
        farToe: [209, 250],
      },
      {
        pelvis: [200, 165],
        chest: [200, 110],
        head: [200, 85],
        nearShoulder: [200, 110],
        nearElbow: [225, 65],
        nearWrist: [205, 30],
        nearHip: [200, 165],
        nearKnee: [220, 210],
        nearAnkle: [240, 250],
        nearToe: [255, 250],
        farShoulder: [194, 106],
        farElbow: [175, 65],
        farWrist: [195, 30],
        farHip: [194, 161],
        farKnee: [180, 210],
        farAnkle: [160, 250],
        farToe: [145, 250],
      },
    ],
  },

  // 14. Step Jacks (Cardio sans saut)
  step_jacks: {
    durationMs: 1400,
    frames: [
      {
        pelvis: [200, 165],
        chest: [200, 110],
        head: [200, 85],
        nearShoulder: [200, 110],
        nearElbow: [190, 145],
        nearWrist: [190, 185],
        nearHip: [200, 165],
        nearKnee: [200, 210],
        nearAnkle: [200, 250],
        nearToe: [215, 250],
        farShoulder: [194, 106],
        farElbow: [184, 141],
        farWrist: [184, 181],
        farHip: [194, 161],
        farKnee: [194, 206],
        farAnkle: [194, 250],
        farToe: [209, 250],
      },
      {
        pelvis: [200, 165],
        chest: [200, 110],
        head: [200, 85],
        nearShoulder: [200, 110],
        nearElbow: [220, 70],
        nearWrist: [205, 35],
        nearHip: [200, 165],
        nearKnee: [210, 210],
        nearAnkle: [225, 250],
        nearToe: [240, 250],
        farShoulder: [194, 106],
        farElbow: [180, 70],
        farWrist: [195, 35],
        farHip: [194, 161],
        farKnee: [180, 215],
        farAnkle: [160, 250],
        farToe: [150, 250],
      },
    ],
  },

  // 15. Mountain Climbers
  mountain_climbers: {
    durationMs: 1600,
    frames: [
      {
        pelvis: [180, 190],
        chest: [245, 165],
        head: [270, 145],
        nearShoulder: [245, 165],
        nearElbow: [245, 205],
        nearWrist: [245, 250],
        nearHip: [180, 190],
        nearKnee: [225, 220],
        nearAnkle: [210, 248],
        nearToe: [200, 250],
        farShoulder: [240, 161],
        farElbow: [240, 201],
        farWrist: [240, 250],
        farHip: [175, 186],
        farKnee: [120, 220],
        farAnkle: [70, 248],
        farToe: [55, 250],
      },
      {
        pelvis: [180, 190],
        chest: [245, 165],
        head: [270, 145],
        nearShoulder: [245, 165],
        nearElbow: [245, 205],
        nearWrist: [245, 250],
        nearHip: [180, 190],
        nearKnee: [120, 220],
        nearAnkle: [70, 248],
        nearToe: [55, 250],
        farShoulder: [240, 161],
        farElbow: [240, 201],
        farWrist: [240, 250],
        farHip: [175, 186],
        farKnee: [225, 220],
        farAnkle: [210, 248],
        farToe: [200, 250],
      },
    ],
  },

  // 16. Marche sur place / High Knees (Debout droit, genoux alternés haut)
  high_knees: {
    durationMs: 1600,
    frames: [
      {
        pelvis: [200, 165],
        chest: [200, 110],
        head: [200, 85],
        nearShoulder: [200, 110],
        nearElbow: [220, 130],
        nearWrist: [240, 110],
        nearHip: [200, 165],
        nearKnee: [235, 165],
        nearAnkle: [235, 220],
        nearToe: [255, 225],
        farShoulder: [194, 106],
        farElbow: [175, 135],
        farWrist: [160, 165],
        farHip: [194, 161],
        farKnee: [195, 210],
        farAnkle: [195, 250],
        farToe: [215, 250],
      },
      {
        pelvis: [200, 165],
        chest: [200, 110],
        head: [200, 85],
        nearShoulder: [200, 110],
        nearElbow: [175, 135],
        nearWrist: [160, 165],
        nearHip: [200, 165],
        nearKnee: [200, 210],
        nearAnkle: [200, 250],
        nearToe: [220, 250],
        farShoulder: [194, 106],
        farElbow: [215, 130],
        farWrist: [235, 110],
        farHip: [194, 161],
        farKnee: [230, 165],
        farAnkle: [230, 220],
        farToe: [250, 225],
      },
    ],
  },

  // 17. Superman (extension dos au sol)
  superman: {
    durationMs: 2500,
    frames: [
      {
        pelvis: [180, 250],
        chest: [230, 250],
        head: [260, 245],
        nearShoulder: [230, 250],
        nearElbow: [270, 250],
        nearWrist: [310, 250],
        nearHip: [180, 250],
        nearKnee: [130, 250],
        nearAnkle: [80, 250],
        nearToe: [65, 250],
        farShoulder: [225, 246],
        farElbow: [265, 246],
        farWrist: [305, 246],
        farHip: [175, 246],
        farKnee: [125, 246],
        farAnkle: [75, 246],
        farToe: [60, 246],
      },
      {
        pelvis: [180, 250],
        chest: [230, 235],
        head: [265, 210],
        nearShoulder: [230, 235],
        nearElbow: [275, 205],
        nearWrist: [320, 190],
        nearHip: [180, 250],
        nearKnee: [130, 235],
        nearAnkle: [80, 220],
        nearToe: [65, 210],
        farShoulder: [225, 231],
        farElbow: [270, 201],
        farWrist: [315, 186],
        farHip: [175, 246],
        farKnee: [125, 231],
        farAnkle: [75, 216],
        farToe: [60, 206],
      },
    ],
  },

  // 18. Bird-Dog (Quatre pattes opposé)
  bird_dog: {
    durationMs: 2600,
    frames: [
      {
        pelvis: [160, 195],
        chest: [220, 195],
        head: [250, 180],
        nearShoulder: [220, 195],
        nearElbow: [220, 225],
        nearWrist: [220, 250],
        nearHip: [160, 195],
        nearKnee: [160, 250],
        nearAnkle: [120, 250],
        nearToe: [110, 250],
        farShoulder: [215, 191],
        farElbow: [215, 221],
        farWrist: [215, 250],
        farHip: [155, 191],
        farKnee: [155, 250],
        farAnkle: [115, 250],
        farToe: [105, 250],
      },
      {
        pelvis: [160, 195],
        chest: [220, 195],
        head: [250, 180],
        nearShoulder: [220, 195],
        nearElbow: [270, 195],
        nearWrist: [315, 195],
        nearHip: [160, 195],
        nearKnee: [160, 250],
        nearAnkle: [120, 250],
        nearToe: [110, 250],
        farShoulder: [215, 191],
        farElbow: [215, 221],
        farWrist: [215, 250],
        farHip: [155, 191],
        farKnee: [110, 195],
        farAnkle: [60, 195],
        farToe: [45, 195],
      },
    ],
  },

  // 19. Cat-Cow (Mobilité vertébrale quadrupède)
  cat_cow: {
    durationMs: 3200,
    frames: [
      // Cow (dos creusé doux, tête relevée)
      {
        pelvis: [160, 185],
        chest: [220, 190],
        head: [250, 165],
        nearShoulder: [220, 190],
        nearElbow: [220, 220],
        nearWrist: [220, 250],
        nearHip: [160, 185],
        nearKnee: [160, 250],
        nearAnkle: [120, 250],
        nearToe: [110, 250],
        farShoulder: [215, 186],
        farElbow: [215, 216],
        farWrist: [215, 250],
        farHip: [155, 181],
        farKnee: [155, 250],
        farAnkle: [115, 250],
        farToe: [105, 250],
      },
      // Cat (dos rond, menton rentré)
      {
        pelvis: [160, 180],
        chest: [220, 165],
        head: [240, 210],
        nearShoulder: [220, 165],
        nearElbow: [220, 215],
        nearWrist: [220, 250],
        nearHip: [160, 180],
        nearKnee: [160, 250],
        nearAnkle: [120, 250],
        nearToe: [110, 250],
        farShoulder: [215, 161],
        farElbow: [215, 211],
        farWrist: [215, 250],
        farHip: [155, 176],
        farKnee: [155, 250],
        farAnkle: [115, 250],
        farToe: [105, 250],
      },
    ],
  },

  // 20. Posture de l'enfant (Child pose)
  child_pose: {
    durationMs: 3500,
    frames: [
      {
        pelvis: [125, 235],
        chest: [180, 235],
        head: [210, 245],
        nearShoulder: [180, 235],
        nearElbow: [235, 250],
        nearWrist: [280, 250],
        nearHip: [125, 235],
        nearKnee: [150, 250],
        nearAnkle: [110, 250],
        nearToe: [95, 250],
        farShoulder: [175, 231],
        farElbow: [230, 250],
        farWrist: [275, 250],
        farHip: [120, 231],
        farKnee: [145, 250],
        farAnkle: [105, 250],
        farToe: [90, 250],
      },
      {
        pelvis: [125, 237],
        chest: [180, 237],
        head: [210, 247],
        nearShoulder: [180, 237],
        nearElbow: [240, 250],
        nearWrist: [285, 250],
        nearHip: [125, 237],
        nearKnee: [150, 250],
        nearAnkle: [110, 250],
        nearToe: [95, 250],
        farShoulder: [175, 233],
        farElbow: [235, 250],
        farWrist: [280, 250],
        farHip: [120, 233],
        farKnee: [145, 250],
        farAnkle: [105, 250],
        farToe: [90, 250],
      },
    ],
  },

  // 21. Cobra / Sphinx stretch
  cobra_stretch: {
    durationMs: 3000,
    frames: [
      {
        pelvis: [170, 250],
        chest: [225, 215],
        head: [250, 175],
        nearShoulder: [225, 215],
        nearElbow: [225, 240],
        nearWrist: [250, 250],
        nearHip: [170, 250],
        nearKnee: [120, 250],
        nearAnkle: [70, 250],
        nearToe: [55, 250],
        farShoulder: [220, 211],
        farElbow: [220, 236],
        farWrist: [245, 250],
        farHip: [165, 246],
        farKnee: [115, 246],
        farAnkle: [65, 246],
        farToe: [50, 246],
      },
      {
        pelvis: [170, 250],
        chest: [225, 210],
        head: [250, 170],
        nearShoulder: [225, 210],
        nearElbow: [225, 238],
        nearWrist: [250, 250],
        nearHip: [170, 250],
        nearKnee: [120, 250],
        nearAnkle: [70, 250],
        nearToe: [55, 250],
        farShoulder: [220, 206],
        farElbow: [220, 234],
        farWrist: [245, 250],
        farHip: [165, 246],
        farKnee: [115, 246],
        farAnkle: [65, 246],
        farToe: [50, 246],
      },
    ],
  },

  // 22. Enroulement vertébral doux (Forward fold)
  forward_fold: {
    durationMs: 2800,
    frames: [
      {
        pelvis: [195, 145],
        chest: [205, 170],
        head: [210, 195],
        nearShoulder: [205, 170],
        nearElbow: [215, 205],
        nearWrist: [215, 240],
        nearHip: [195, 145],
        nearKnee: [195, 200],
        nearAnkle: [195, 250],
        nearToe: [215, 250],
        farShoulder: [189, 166],
        farElbow: [199, 201],
        farWrist: [199, 236],
        farHip: [189, 141],
        farKnee: [189, 196],
        farAnkle: [189, 250],
        farToe: [209, 250],
      },
      {
        pelvis: [195, 140],
        chest: [200, 185],
        head: [200, 215],
        nearShoulder: [200, 185],
        nearElbow: [210, 215],
        nearWrist: [210, 248],
        nearHip: [195, 140],
        nearKnee: [195, 200],
        nearAnkle: [195, 250],
        nearToe: [215, 250],
        farShoulder: [189, 181],
        farElbow: [199, 211],
        farWrist: [199, 244],
        farHip: [189, 136],
        farKnee: [189, 196],
        farAnkle: [189, 250],
        farToe: [209, 250],
      },
    ],
  },

  // 23. Étirement quadriceps debout
  quad_stretch: {
    durationMs: 2500,
    hasWall: true,
    frames: [
      {
        pelvis: [190, 165],
        chest: [190, 110],
        head: [190, 85],
        nearShoulder: [190, 110],
        nearElbow: [155, 115],
        nearWrist: [120, 115],
        nearHip: [190, 165],
        nearKnee: [190, 210],
        nearAnkle: [190, 250],
        nearToe: [210, 250],
        farShoulder: [184, 106],
        farElbow: [175, 145],
        farWrist: [170, 165],
        farHip: [184, 161],
        farKnee: [190, 210],
        farAnkle: [170, 165],
        farToe: [165, 160],
      },
      {
        pelvis: [192, 165],
        chest: [192, 110],
        head: [192, 85],
        nearShoulder: [192, 110],
        nearElbow: [157, 115],
        nearWrist: [120, 115],
        nearHip: [192, 165],
        nearKnee: [190, 210],
        nearAnkle: [190, 250],
        nearToe: [210, 250],
        farShoulder: [186, 106],
        farElbow: [177, 145],
        farWrist: [170, 163],
        farHip: [186, 161],
        farKnee: [190, 210],
        farAnkle: [168, 163],
        farToe: [163, 158],
      },
    ],
  },

  // Fallbacks with full bilateral coordinates
  arm_circles: {
    durationMs: 1800,
    frames: [
      {
        pelvis: [200, 165],
        chest: [200, 110],
        head: [200, 85],
        nearShoulder: [200, 110],
        nearElbow: [240, 110],
        nearWrist: [280, 110],
        nearHip: [200, 165],
        nearKnee: [200, 210],
        nearAnkle: [200, 250],
        nearToe: [220, 250],
        farShoulder: [194, 106],
        farElbow: [234, 106],
        farWrist: [274, 106],
        farHip: [194, 161],
        farKnee: [194, 206],
        farAnkle: [194, 250],
        farToe: [214, 250],
      },
      {
        pelvis: [200, 165],
        chest: [200, 110],
        head: [200, 85],
        nearShoulder: [200, 110],
        nearElbow: [240, 95],
        nearWrist: [280, 85],
        nearHip: [200, 165],
        nearKnee: [200, 210],
        nearAnkle: [200, 250],
        nearToe: [220, 250],
        farShoulder: [194, 106],
        farElbow: [234, 91],
        farWrist: [274, 81],
        farHip: [194, 161],
        farKnee: [194, 206],
        farAnkle: [194, 250],
        farToe: [214, 250],
      },
    ],
  },

  butt_kicks: {
    durationMs: 1500,
    frames: [
      {
        pelvis: [200, 165],
        chest: [200, 110],
        head: [200, 85],
        nearShoulder: [200, 110],
        nearElbow: [215, 135],
        nearWrist: [230, 165],
        nearHip: [200, 165],
        nearKnee: [205, 210],
        nearAnkle: [170, 195],
        nearToe: [160, 205],
        farShoulder: [194, 106],
        farElbow: [180, 135],
        farWrist: [175, 165],
        farHip: [194, 161],
        farKnee: [195, 210],
        farAnkle: [195, 250],
        farToe: [215, 250],
      },
      {
        pelvis: [200, 165],
        chest: [200, 110],
        head: [200, 85],
        nearShoulder: [200, 110],
        nearElbow: [185, 135],
        nearWrist: [180, 165],
        nearHip: [200, 165],
        nearKnee: [200, 210],
        nearAnkle: [200, 250],
        nearToe: [220, 250],
        farShoulder: [194, 106],
        farElbow: [210, 135],
        farWrist: [225, 165],
        farHip: [194, 161],
        farKnee: [200, 210],
        farAnkle: [165, 195],
        farToe: [155, 205],
      },
    ],
  },

  calf_raises: {
    durationMs: 2000,
    frames: [
      {
        pelvis: [200, 165],
        chest: [200, 110],
        head: [200, 85],
        nearShoulder: [200, 110],
        nearElbow: [220, 130],
        nearWrist: [240, 150],
        nearHip: [200, 165],
        nearKnee: [200, 210],
        nearAnkle: [200, 250],
        nearToe: [220, 250],
        farShoulder: [194, 106],
        farElbow: [214, 126],
        farWrist: [234, 146],
        farHip: [194, 161],
        farKnee: [194, 206],
        farAnkle: [194, 250],
        farToe: [214, 250],
      },
      {
        pelvis: [200, 145],
        chest: [200, 90],
        head: [200, 65],
        nearShoulder: [200, 90],
        nearElbow: [220, 110],
        nearWrist: [240, 130],
        nearHip: [200, 145],
        nearKnee: [200, 190],
        nearAnkle: [200, 230],
        nearToe: [220, 250],
        farShoulder: [194, 86],
        farElbow: [214, 106],
        farWrist: [234, 126],
        farHip: [194, 141],
        farKnee: [194, 186],
        farAnkle: [194, 230],
        farToe: [214, 250],
      },
    ],
  },

  shadow_boxing: {
    durationMs: 1400,
    frames: [
      {
        pelvis: [200, 165],
        chest: [200, 110],
        head: [200, 85],
        nearShoulder: [200, 110],
        nearElbow: [220, 120],
        nearWrist: [210, 95],
        nearHip: [200, 165],
        nearKnee: [210, 210],
        nearAnkle: [210, 250],
        nearToe: [235, 250],
        farShoulder: [194, 106],
        farElbow: [214, 116],
        farWrist: [245, 100],
        farHip: [194, 161],
        farKnee: [190, 210],
        farAnkle: [190, 250],
        farToe: [215, 250],
      },
      {
        pelvis: [205, 165],
        chest: [215, 110],
        head: [215, 85],
        nearShoulder: [215, 110],
        nearElbow: [255, 110],
        nearWrist: [305, 110],
        nearHip: [205, 165],
        nearKnee: [220, 210],
        nearAnkle: [220, 250],
        nearToe: [245, 250],
        farShoulder: [194, 106],
        farElbow: [200, 125],
        farWrist: [195, 100],
        farHip: [194, 161],
        farKnee: [190, 210],
        farAnkle: [190, 250],
        farToe: [215, 250],
      },
    ],
  },

  pike_pushup: {
    durationMs: 2200,
    frames: [
      {
        pelvis: [175, 130],
        chest: [215, 175],
        head: [230, 155],
        nearShoulder: [215, 175],
        nearElbow: [240, 215],
        nearWrist: [250, 250],
        nearHip: [175, 130],
        nearKnee: [145, 195],
        nearAnkle: [115, 250],
        nearToe: [130, 250],
        farShoulder: [210, 171],
        farElbow: [235, 211],
        farWrist: [245, 250],
        farHip: [170, 126],
        farKnee: [140, 191],
        farAnkle: [110, 250],
        farToe: [125, 250],
      },
      {
        pelvis: [170, 145],
        chest: [225, 200],
        head: [245, 220],
        nearShoulder: [225, 200],
        nearElbow: [265, 215],
        nearWrist: [250, 250],
        nearHip: [170, 145],
        nearKnee: [145, 200],
        nearAnkle: [115, 250],
        nearToe: [130, 250],
        farShoulder: [220, 196],
        farElbow: [260, 211],
        farWrist: [245, 250],
        farHip: [165, 141],
        farKnee: [140, 196],
        farAnkle: [110, 250],
        farToe: [125, 250],
      },
    ],
  },

  deadbug: {
    durationMs: 2600,
    frames: [
      {
        pelvis: [195, 248],
        chest: [140, 248],
        head: [90, 245],
        nearShoulder: [140, 248],
        nearElbow: [140, 190],
        nearWrist: [140, 140],
        nearHip: [195, 248],
        nearKnee: [195, 185],
        nearAnkle: [245, 185],
        nearToe: [260, 185],
        farShoulder: [135, 244],
        farElbow: [135, 186],
        farWrist: [135, 136],
        farHip: [190, 244],
        farKnee: [190, 181],
        farAnkle: [240, 181],
        farToe: [255, 181],
      },
      {
        pelvis: [195, 248],
        chest: [140, 248],
        head: [90, 245],
        nearShoulder: [140, 248],
        nearElbow: [90, 248],
        nearWrist: [40, 248],
        nearHip: [195, 248],
        nearKnee: [235, 215],
        nearAnkle: [285, 240],
        nearToe: [305, 240],
        farShoulder: [135, 244],
        farElbow: [135, 186],
        farWrist: [135, 136],
        farHip: [190, 244],
        farKnee: [190, 181],
        farAnkle: [240, 181],
        farToe: [255, 181],
      },
    ],
  },

  shoulder_taps: {
    durationMs: 2000,
    frames: [
      {
        pelvis: [175, 175],
        chest: [245, 160],
        head: [270, 145],
        nearShoulder: [245, 160],
        nearElbow: [245, 205],
        nearWrist: [245, 250],
        nearHip: [175, 175],
        nearKnee: [120, 210],
        nearAnkle: [70, 245],
        nearToe: [55, 250],
        farShoulder: [240, 156],
        farElbow: [240, 201],
        farWrist: [240, 250],
        farHip: [170, 171],
        farKnee: [115, 206],
        farAnkle: [65, 241],
        farToe: [50, 250],
      },
      {
        pelvis: [175, 175],
        chest: [245, 160],
        head: [270, 145],
        nearShoulder: [245, 160],
        nearElbow: [220, 175],
        nearWrist: [240, 160],
        nearHip: [175, 175],
        nearKnee: [120, 210],
        nearAnkle: [70, 245],
        nearToe: [55, 250],
        farShoulder: [240, 156],
        farElbow: [240, 201],
        farWrist: [240, 250],
        farHip: [170, 171],
        farKnee: [115, 206],
        farAnkle: [65, 241],
        farToe: [50, 250],
      },
    ],
  },

  burpees_slow: {
    durationMs: 3000,
    frames: [
      {
        pelvis: [200, 165],
        chest: [200, 110],
        head: [200, 85],
        nearShoulder: [200, 110],
        nearElbow: [195, 145],
        nearWrist: [195, 185],
        nearHip: [200, 165],
        nearKnee: [200, 210],
        nearAnkle: [200, 250],
        nearToe: [220, 250],
        farShoulder: [194, 106],
        farElbow: [189, 141],
        farWrist: [189, 181],
        farHip: [194, 161],
        farKnee: [194, 206],
        farAnkle: [194, 250],
        farToe: [214, 250],
      },
      {
        pelvis: [175, 180],
        chest: [245, 165],
        head: [270, 145],
        nearShoulder: [245, 165],
        nearElbow: [245, 210],
        nearWrist: [245, 250],
        nearHip: [175, 180],
        nearKnee: [120, 215],
        nearAnkle: [70, 248],
        nearToe: [55, 250],
        farShoulder: [240, 161],
        farElbow: [240, 206],
        farWrist: [240, 250],
        farHip: [170, 176],
        farKnee: [115, 211],
        farAnkle: [65, 244],
        farToe: [50, 250],
      },
    ],
  },

  bear_crawl: {
    durationMs: 2000,
    frames: [
      {
        pelvis: [170, 180],
        chest: [230, 195],
        head: [260, 180],
        nearShoulder: [230, 195],
        nearElbow: [230, 225],
        nearWrist: [230, 250],
        nearHip: [170, 180],
        nearKnee: [160, 230],
        nearAnkle: [130, 250],
        nearToe: [120, 250],
        farShoulder: [225, 191],
        farElbow: [225, 221],
        farWrist: [225, 250],
        farHip: [165, 176],
        farKnee: [155, 226],
        farAnkle: [125, 250],
        farToe: [115, 250],
      },
      {
        pelvis: [170, 180],
        chest: [230, 195],
        head: [260, 180],
        nearShoulder: [230, 195],
        nearElbow: [230, 225],
        nearWrist: [230, 250],
        nearHip: [170, 180],
        nearKnee: [180, 225],
        nearAnkle: [150, 250],
        nearToe: [140, 250],
        farShoulder: [225, 191],
        farElbow: [225, 221],
        farWrist: [225, 250],
        farHip: [165, 176],
        farKnee: [175, 221],
        farAnkle: [145, 250],
        farToe: [135, 250],
      },
    ],
  },

  inchworm: {
    durationMs: 3000,
    frames: [
      {
        pelvis: [180, 140],
        chest: [220, 180],
        head: [235, 200],
        nearShoulder: [220, 180],
        nearElbow: [225, 220],
        nearWrist: [225, 250],
        nearHip: [180, 140],
        nearKnee: [180, 200],
        nearAnkle: [180, 250],
        nearToe: [205, 250],
        farShoulder: [214, 176],
        farElbow: [219, 216],
        farWrist: [219, 250],
        farHip: [174, 136],
        farKnee: [174, 196],
        farAnkle: [174, 250],
        farToe: [199, 250],
      },
      {
        pelvis: [175, 180],
        chest: [245, 165],
        head: [270, 145],
        nearShoulder: [245, 165],
        nearElbow: [245, 210],
        nearWrist: [245, 250],
        nearHip: [175, 180],
        nearKnee: [120, 215],
        nearAnkle: [70, 248],
        nearToe: [55, 250],
        farShoulder: [240, 161],
        farElbow: [240, 206],
        farWrist: [240, 250],
        farHip: [170, 176],
        farKnee: [115, 211],
        farAnkle: [65, 244],
        farToe: [50, 250],
      },
    ],
  },

  hip_hinge: {
    durationMs: 2400,
    frames: [
      {
        pelvis: [200, 165],
        chest: [200, 110],
        head: [200, 85],
        nearShoulder: [200, 110],
        nearElbow: [200, 145],
        nearWrist: [200, 180],
        nearHip: [200, 165],
        nearKnee: [200, 210],
        nearAnkle: [200, 250],
        nearToe: [220, 250],
        farShoulder: [194, 106],
        farElbow: [194, 141],
        farWrist: [194, 176],
        farHip: [194, 161],
        farKnee: [194, 206],
        farAnkle: [194, 250],
        farToe: [214, 250],
      },
      {
        pelvis: [155, 175],
        chest: [235, 165],
        head: [255, 150],
        nearShoulder: [235, 165],
        nearElbow: [235, 200],
        nearWrist: [235, 235],
        nearHip: [155, 175],
        nearKnee: [180, 215],
        nearAnkle: [195, 250],
        nearToe: [220, 250],
        farShoulder: [229, 161],
        farElbow: [229, 196],
        farWrist: [229, 231],
        farHip: [149, 171],
        farKnee: [174, 211],
        farAnkle: [189, 250],
        farToe: [214, 250],
      },
    ],
  },

  russian_twists: {
    durationMs: 2000,
    frames: [
      {
        pelvis: [200, 245],
        chest: [165, 190],
        head: [140, 165],
        nearShoulder: [165, 190],
        nearElbow: [200, 200],
        nearWrist: [225, 215],
        nearHip: [200, 245],
        nearKnee: [255, 195],
        nearAnkle: [300, 215],
        nearToe: [315, 215],
        farShoulder: [160, 186],
        farElbow: [195, 196],
        farWrist: [220, 211],
        farHip: [195, 241],
        farKnee: [250, 191],
        farAnkle: [295, 211],
        farToe: [310, 211],
      },
      {
        pelvis: [200, 245],
        chest: [165, 190],
        head: [140, 165],
        nearShoulder: [165, 190],
        nearElbow: [175, 210],
        nearWrist: [185, 240],
        nearHip: [200, 245],
        nearKnee: [255, 195],
        nearAnkle: [300, 215],
        nearToe: [315, 215],
        farShoulder: [160, 186],
        farElbow: [170, 206],
        farWrist: [180, 236],
        farHip: [195, 241],
        farKnee: [250, 191],
        farAnkle: [295, 211],
        farToe: [310, 211],
      },
    ],
  },

  seated_bicep_isometric: {
    durationMs: 2000,
    frames: [
      {
        pelvis: [200, 165],
        chest: [200, 110],
        head: [200, 85],
        nearShoulder: [200, 110],
        nearElbow: [200, 145],
        nearWrist: [200, 180],
        nearHip: [200, 165],
        nearKnee: [200, 210],
        nearAnkle: [200, 250],
        nearToe: [220, 250],
        farShoulder: [194, 106],
        farElbow: [194, 141],
        farWrist: [194, 176],
        farHip: [194, 161],
        farKnee: [194, 206],
        farAnkle: [194, 250],
        farToe: [214, 250],
      },
      {
        pelvis: [200, 165],
        chest: [200, 110],
        head: [200, 85],
        nearShoulder: [200, 110],
        nearElbow: [205, 145],
        nearWrist: [220, 120],
        nearHip: [200, 165],
        nearKnee: [200, 210],
        nearAnkle: [200, 250],
        nearToe: [220, 250],
        farShoulder: [194, 106],
        farElbow: [199, 141],
        farWrist: [214, 116],
        farHip: [194, 161],
        farKnee: [194, 206],
        farAnkle: [194, 250],
        farToe: [214, 250],
      },
    ],
  },

  towel_row: {
    durationMs: 2200,
    frames: [
      {
        pelvis: [200, 245],
        chest: [170, 180],
        head: [150, 155],
        nearShoulder: [170, 180],
        nearElbow: [215, 190],
        nearWrist: [255, 195],
        nearHip: [200, 245],
        nearKnee: [260, 210],
        nearAnkle: [310, 245],
        nearToe: [325, 245],
        farShoulder: [165, 176],
        farElbow: [210, 186],
        farWrist: [250, 191],
        farHip: [195, 241],
        farKnee: [255, 206],
        farAnkle: [305, 245],
        farToe: [320, 245],
      },
      {
        pelvis: [200, 245],
        chest: [175, 180],
        head: [155, 155],
        nearShoulder: [175, 180],
        nearElbow: [155, 195],
        nearWrist: [195, 195],
        nearHip: [200, 245],
        nearKnee: [260, 210],
        nearAnkle: [310, 245],
        nearToe: [325, 245],
        farShoulder: [170, 176],
        farElbow: [150, 191],
        farWrist: [190, 191],
        farHip: [195, 241],
        farKnee: [255, 206],
        farAnkle: [305, 245],
        farToe: [320, 245],
      },
    ],
  },

  doorframe_row: {
    durationMs: 2200,
    hasWall: true,
    frames: [
      {
        pelvis: [175, 185],
        chest: [145, 130],
        head: [155, 110],
        nearShoulder: [145, 130],
        nearElbow: [105, 140],
        nearWrist: [65, 145],
        nearHip: [175, 185],
        nearKnee: [190, 220],
        nearAnkle: [200, 250],
        nearToe: [215, 250],
        farShoulder: [140, 126],
        farElbow: [100, 136],
        farWrist: [65, 145],
        farHip: [170, 181],
        farKnee: [185, 216],
        farAnkle: [195, 250],
        farToe: [210, 250],
      },
      {
        pelvis: [135, 185],
        chest: [100, 130],
        head: [110, 110],
        nearShoulder: [100, 130],
        nearElbow: [105, 170],
        nearWrist: [65, 145],
        nearHip: [135, 185],
        nearKnee: [170, 220],
        nearAnkle: [200, 250],
        nearToe: [215, 250],
        farShoulder: [95, 126],
        farElbow: [100, 166],
        farWrist: [65, 145],
        farHip: [130, 181],
        farKnee: [165, 216],
        farAnkle: [195, 250],
        farToe: [210, 250],
      },
    ],
  },

  wrist_rotations: {
    durationMs: 1500,
    frames: [
      {
        pelvis: [200, 165],
        chest: [200, 110],
        head: [200, 85],
        nearShoulder: [200, 110],
        nearElbow: [230, 120],
        nearWrist: [265, 110],
        nearHip: [200, 165],
        nearKnee: [200, 210],
        nearAnkle: [200, 250],
        nearToe: [220, 250],
        farShoulder: [194, 106],
        farElbow: [224, 116],
        farWrist: [259, 106],
        farHip: [194, 161],
        farKnee: [194, 206],
        farAnkle: [194, 250],
        farToe: [214, 250],
      },
      {
        pelvis: [200, 165],
        chest: [200, 110],
        head: [200, 85],
        nearShoulder: [200, 110],
        nearElbow: [230, 120],
        nearWrist: [265, 125],
        nearHip: [200, 165],
        nearKnee: [200, 210],
        nearAnkle: [200, 250],
        nearToe: [220, 250],
        farShoulder: [194, 106],
        farElbow: [224, 116],
        farWrist: [259, 121],
        farHip: [194, 161],
        farKnee: [194, 206],
        farAnkle: [194, 250],
        farToe: [214, 250],
      },
    ],
  },

  torso_twist: {
    durationMs: 1800,
    frames: [
      {
        pelvis: [200, 165],
        chest: [195, 110],
        head: [195, 85],
        nearShoulder: [195, 110],
        nearElbow: [170, 130],
        nearWrist: [150, 145],
        nearHip: [200, 165],
        nearKnee: [200, 210],
        nearAnkle: [200, 250],
        nearToe: [220, 250],
        farShoulder: [205, 106],
        farElbow: [235, 126],
        farWrist: [255, 141],
        farHip: [194, 161],
        farKnee: [194, 206],
        farAnkle: [194, 250],
        farToe: [214, 250],
      },
      {
        pelvis: [200, 165],
        chest: [205, 110],
        head: [205, 85],
        nearShoulder: [205, 110],
        nearElbow: [235, 130],
        nearWrist: [255, 145],
        nearHip: [200, 165],
        nearKnee: [200, 210],
        nearAnkle: [200, 250],
        nearToe: [220, 250],
        farShoulder: [195, 106],
        farElbow: [170, 126],
        farWrist: [150, 141],
        farHip: [194, 161],
        farKnee: [194, 206],
        farAnkle: [194, 250],
        farToe: [214, 250],
      },
    ],
  },
};

export const DEFAULT_STANDING_POSE: Joint2D = {
  pelvis: [200, 165],
  chest: [200, 110],
  head: [200, 85],
  nearShoulder: [200, 110],
  nearElbow: [215, 135],
  nearWrist: [225, 160],
  nearHip: [200, 165],
  nearKnee: [200, 210],
  nearAnkle: [200, 250],
  nearToe: [220, 250],
  farShoulder: [194, 106],
  farElbow: [180, 135],
  farWrist: [175, 160],
  farHip: [194, 161],
  farKnee: [194, 206],
  farAnkle: [194, 250],
  farToe: [214, 250],
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function sanitizeCoordinate(val: unknown, fallback: number): number {
  return typeof val === 'number' && Number.isFinite(val) ? val : fallback;
}

export function sanitizeJoint(
  raw: [number, number] | undefined,
  fallback: [number, number]
): [number, number] {
  if (!raw || !Array.isArray(raw)) return [fallback[0], fallback[1]];
  return [
    sanitizeCoordinate(raw[0], fallback[0]),
    sanitizeCoordinate(raw[1], fallback[1]),
  ];
}

export function mergeWithDefaultStanding(raw: Partial<Joint2D> | undefined): Joint2D {
  const d = DEFAULT_STANDING_POSE;
  if (!raw) return { ...d };
  return {
    pelvis: sanitizeJoint(raw.pelvis, d.pelvis),
    chest: sanitizeJoint(raw.chest, d.chest),
    head: sanitizeJoint(raw.head, d.head),
    nearShoulder: sanitizeJoint(raw.nearShoulder, d.nearShoulder),
    nearElbow: sanitizeJoint(raw.nearElbow, d.nearElbow),
    nearWrist: sanitizeJoint(raw.nearWrist, d.nearWrist),
    nearHip: sanitizeJoint(raw.nearHip, d.nearHip),
    nearKnee: sanitizeJoint(raw.nearKnee, d.nearKnee),
    nearAnkle: sanitizeJoint(raw.nearAnkle, d.nearAnkle),
    nearToe: sanitizeJoint(raw.nearToe, d.nearToe),
    farShoulder: sanitizeJoint(raw.farShoulder, d.farShoulder),
    farElbow: sanitizeJoint(raw.farElbow, d.farElbow),
    farWrist: sanitizeJoint(raw.farWrist, d.farWrist),
    farHip: sanitizeJoint(raw.farHip, d.farHip),
    farKnee: sanitizeJoint(raw.farKnee, d.farKnee),
    farAnkle: sanitizeJoint(raw.farAnkle, d.farAnkle),
    farToe: sanitizeJoint(raw.farToe, d.farToe),
  };
}

function safeLerp2D(
  p1: [number, number] | undefined,
  p2: [number, number] | undefined,
  t: number,
  fallback: [number, number]
): [number, number] {
  const s1 = sanitizeJoint(p1, fallback);
  const s2 = sanitizeJoint(p2, fallback);
  const x = lerp(s1[0], s2[0], t);
  const y = lerp(s1[1], s2[1], t);
  return [
    Number.isFinite(x) ? x : fallback[0],
    Number.isFinite(y) ? y : fallback[1],
  ];
}

/**
 * Valide les positions de chaque keyframe de CHAQUE exercice
 * et loggue toute coordonnée NaN, tout segment de longueur nulle ou toute tête détachée du torse.
 */
export function validateAnimations(): { valid: boolean; totalPoses: number; errors: string[] } {
  const errors: string[] = [];
  const poseKeys = Object.keys(POSE_LIBRARY) as MannequinPoseType[];

  for (const poseKey of poseKeys) {
    const poseDef = POSE_LIBRARY[poseKey];
    if (!poseDef) {
      errors.push(`Pose manquante : "${poseKey}"`);
      continue;
    }
    if (!poseDef.frames || poseDef.frames.length < 2) {
      errors.push(`Pose "${poseKey}" a moins de 2 keyframes.`);
      continue;
    }

    poseDef.frames.forEach((rawFrame, frameIdx) => {
      const frame = mergeWithDefaultStanding(rawFrame);
      const jointKeys = Object.keys(DEFAULT_STANDING_POSE) as (keyof Joint2D)[];

      // 1. Coordonnées NaN ou invalides
      for (const jk of jointKeys) {
        const pt = frame[jk];
        if (!pt || !Array.isArray(pt) || pt.length < 2 || !Number.isFinite(pt[0]) || !Number.isFinite(pt[1])) {
          errors.push(`Pose "${poseKey}" frame ${frameIdx} : coordonnée NaN pour joint "${jk}".`);
        }
      }

      // 2. Longueur du torse (pelvis -> chest)
      const torsoDx = frame.chest[0] - frame.pelvis[0];
      const torsoDy = frame.chest[1] - frame.pelvis[1];
      const torsoLen = Math.hypot(torsoDx, torsoDy);
      if (torsoLen < 15) {
        errors.push(`Pose "${poseKey}" frame ${frameIdx} : torse de longueur nulle ou trop courte (${torsoLen.toFixed(1)}px).`);
      }

      // 3. Connexion tête-torse (chest -> head)
      const neckDx = frame.head[0] - frame.chest[0];
      const neckDy = frame.head[1] - frame.chest[1];
      const neckLen = Math.hypot(neckDx, neckDy);
      if (neckLen < 5 || neckLen > 75) {
        errors.push(`Pose "${poseKey}" frame ${frameIdx} : tête détachée du torse (distance ${neckLen.toFixed(1)}px).`);
      }

      // 4. Segments des membres
      const checkSeg = (p1: [number, number], p2: [number, number], label: string) => {
        const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
        if (len < 8) {
          errors.push(`Pose "${poseKey}" frame ${frameIdx} : segment "${label}" de longueur nulle ou trop courte (${len.toFixed(1)}px).`);
        }
      };

      checkSeg(frame.nearHip, frame.nearKnee, 'cuisse avant');
      checkSeg(frame.nearKnee, frame.nearAnkle, 'mollet avant');
      checkSeg(frame.nearShoulder, frame.nearElbow, 'bras avant');
      checkSeg(frame.nearElbow, frame.nearWrist, 'avant-bras avant');
      checkSeg(frame.farHip, frame.farKnee, 'cuisse arrière');
      checkSeg(frame.farKnee, frame.farAnkle, 'mollet arrière');
      checkSeg(frame.farShoulder, frame.farElbow, 'bras arrière');
      checkSeg(frame.farElbow, frame.farWrist, 'avant-bras arrière');
    });
  }

  const valid = errors.length === 0;
  if (valid) {
    console.log(
      `[FitDuo Animations] Validation réussie : ${poseKeys.length} poses (${poseKeys.length * 2} keyframes) vérifiées sans NaN, aucun segment nul et têtes rattachées au torse.`
    );
  } else {
    console.error(`[FitDuo Animations] Erreurs détectées (${errors.length}) :`, errors);
  }

  return { valid, totalPoses: poseKeys.length, errors };
}

// Auto-run validation en dev
if (typeof window !== 'undefined') {
  validateAnimations();
}

interface MannequinProps {
  poseType?: MannequinPoseType;
  colorTheme?: 'emerald' | 'cyan' | 'purple' | 'amber';
  isPaused?: boolean;
  className?: string;
  showFloor?: boolean;
  partnerTag?: string;
}

export const Mannequin: React.FC<MannequinProps> = ({
  poseType = 'squat',
  colorTheme = 'emerald',
  isPaused = false,
  className = '',
  showFloor = true,
  partnerTag,
}) => {
  const poseDef = POSE_LIBRARY[poseType] || POSE_LIBRARY.squat;
  const initialFrame = mergeWithDefaultStanding(poseDef.frames?.[0]);
  const [joints, setJoints] = useState<Joint2D>(initialFrame);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const loop = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      if (!isPaused) {
        const elapsed = timestamp - startTimeRef.current;
        const dur = poseDef.durationMs || 2000;
        const progress = (elapsed % dur) / dur;
        // Smooth cosine ease: 0 -> 1 -> 0
        const easedT = 0.5 - 0.5 * Math.cos(progress * 2 * Math.PI);

        const f0 = mergeWithDefaultStanding(poseDef.frames[0]);
        const f1 = mergeWithDefaultStanding(poseDef.frames[1]);

        const rawJoints: Joint2D = {
          pelvis: safeLerp2D(f0.pelvis, f1.pelvis, easedT, DEFAULT_STANDING_POSE.pelvis),
          chest: safeLerp2D(f0.chest, f1.chest, easedT, DEFAULT_STANDING_POSE.chest),
          head: safeLerp2D(f0.head, f1.head, easedT, DEFAULT_STANDING_POSE.head),
          nearShoulder: safeLerp2D(f0.nearShoulder, f1.nearShoulder, easedT, DEFAULT_STANDING_POSE.nearShoulder),
          nearElbow: safeLerp2D(f0.nearElbow, f1.nearElbow, easedT, DEFAULT_STANDING_POSE.nearElbow),
          nearWrist: safeLerp2D(f0.nearWrist, f1.nearWrist, easedT, DEFAULT_STANDING_POSE.nearWrist),
          nearHip: safeLerp2D(f0.nearHip, f1.nearHip, easedT, DEFAULT_STANDING_POSE.nearHip),
          nearKnee: safeLerp2D(f0.nearKnee, f1.nearKnee, easedT, DEFAULT_STANDING_POSE.nearKnee),
          nearAnkle: safeLerp2D(f0.nearAnkle, f1.nearAnkle, easedT, DEFAULT_STANDING_POSE.nearAnkle),
          nearToe: safeLerp2D(f0.nearToe, f1.nearToe, easedT, DEFAULT_STANDING_POSE.nearToe),
          farShoulder: safeLerp2D(f0.farShoulder, f1.farShoulder, easedT, DEFAULT_STANDING_POSE.farShoulder),
          farElbow: safeLerp2D(f0.farElbow, f1.farElbow, easedT, DEFAULT_STANDING_POSE.farElbow),
          farWrist: safeLerp2D(f0.farWrist, f1.farWrist, easedT, DEFAULT_STANDING_POSE.farWrist),
          farHip: safeLerp2D(f0.farHip, f1.farHip, easedT, DEFAULT_STANDING_POSE.farHip),
          farKnee: safeLerp2D(f0.farKnee, f1.farKnee, easedT, DEFAULT_STANDING_POSE.farKnee),
          farAnkle: safeLerp2D(f0.farAnkle, f1.farAnkle, easedT, DEFAULT_STANDING_POSE.farAnkle),
          farToe: safeLerp2D(f0.farToe, f1.farToe, easedT, DEFAULT_STANDING_POSE.farToe),
        };

        // AUTO VERTICAL GROUND REALIGNMENT:
        // Find the lowest point of any body part, and adjust Y so lowest point touches ground Y = 250 exactly!
        const allYs = [
          rawJoints.pelvis[1],
          rawJoints.chest[1],
          rawJoints.head[1],
          rawJoints.nearWrist[1],
          rawJoints.nearKnee[1],
          rawJoints.nearAnkle[1],
          rawJoints.nearToe[1],
          rawJoints.farWrist[1],
          rawJoints.farKnee[1],
          rawJoints.farAnkle[1],
          rawJoints.farToe[1],
        ].filter((y) => Number.isFinite(y));

        const maxY = allYs.length > 0 ? Math.max(...allYs) : 250;
        const groundOffsetY = Number.isFinite(maxY) ? 250 - maxY : 0;

        const applyOffset = (pt: [number, number], fallback: [number, number]): [number, number] => {
          const x = Number.isFinite(pt[0]) ? pt[0] : fallback[0];
          const y = Number.isFinite(pt[1]) ? pt[1] + groundOffsetY : fallback[1];
          return [x, y];
        };

        setJoints({
          pelvis: applyOffset(rawJoints.pelvis, DEFAULT_STANDING_POSE.pelvis),
          chest: applyOffset(rawJoints.chest, DEFAULT_STANDING_POSE.chest),
          head: applyOffset(rawJoints.head, DEFAULT_STANDING_POSE.head),
          nearShoulder: applyOffset(rawJoints.nearShoulder, DEFAULT_STANDING_POSE.nearShoulder),
          nearElbow: applyOffset(rawJoints.nearElbow, DEFAULT_STANDING_POSE.nearElbow),
          nearWrist: applyOffset(rawJoints.nearWrist, DEFAULT_STANDING_POSE.nearWrist),
          nearHip: applyOffset(rawJoints.nearHip, DEFAULT_STANDING_POSE.nearHip),
          nearKnee: applyOffset(rawJoints.nearKnee, DEFAULT_STANDING_POSE.nearKnee),
          nearAnkle: applyOffset(rawJoints.nearAnkle, DEFAULT_STANDING_POSE.nearAnkle),
          nearToe: applyOffset(rawJoints.nearToe, DEFAULT_STANDING_POSE.nearToe),
          farShoulder: applyOffset(rawJoints.farShoulder, DEFAULT_STANDING_POSE.farShoulder),
          farElbow: applyOffset(rawJoints.farElbow, DEFAULT_STANDING_POSE.farElbow),
          farWrist: applyOffset(rawJoints.farWrist, DEFAULT_STANDING_POSE.farWrist),
          farHip: applyOffset(rawJoints.farHip, DEFAULT_STANDING_POSE.farHip),
          farKnee: applyOffset(rawJoints.farKnee, DEFAULT_STANDING_POSE.farKnee),
          farAnkle: applyOffset(rawJoints.farAnkle, DEFAULT_STANDING_POSE.farAnkle),
          farToe: applyOffset(rawJoints.farToe, DEFAULT_STANDING_POSE.farToe),
        });
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, [poseType, isPaused, poseDef]);

  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '_');
  const gradId = `m-grad-${uid}`;

  const isCyan = colorTheme === 'cyan';
  const mainColor = isCyan ? '#06B6D4' : '#22C55E';
  const secondaryColor = isCyan ? '#38BDF8' : '#10B981';
  // Membres arrière simplement plus sombres, mais 100% opaques (opacity: 1)
  const backLimbColor = isCyan ? '#0369A1' : '#15803D';

  // Auto-cadrage intelligent du viewBox sur la boîte englobante de toute l'animation
  // Garantit que le mannequin remplit au moins 80 % de la hauteur de sa zone
  const dynamicViewBox = (() => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    poseDef.frames.forEach((frame) => {
      const sanitized = mergeWithDefaultStanding(frame);
      Object.entries(sanitized).forEach(([jointName, [x, y]]) => {
        const extraY = jointName === 'head' ? 14 : 0;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y - extraY < minY) minY = y - extraY;
        if (y > maxY) maxY = y;
      });
    });

    if (poseDef.hasWall) {
      minX = Math.min(minX, 40);
      minY = Math.min(minY, 40);
    }
    if (poseDef.hasChair) {
      minX = Math.min(minX, 145);
      maxX = Math.max(maxX, 230);
      minY = Math.min(minY, 135);
    }

    maxY = Math.max(maxY, 252);

    const padX = 22;
    const padY = 16;
    const vbX = Math.round(minX - padX);
    const vbY = Math.round(minY - padY);
    const vbW = Math.max(120, Math.round(maxX - minX + padX * 2));
    const vbH = Math.max(120, Math.round(maxY - minY + padY * 2));

    return `${vbX} ${vbY} ${vbW} ${vbH}`;
  })();

  // Calcul du centre d'appui au sol pour l'ombre
  const groundContacts = [
    joints.nearToe,
    joints.nearAnkle,
    joints.farToe,
    joints.farAnkle,
    joints.nearWrist,
    joints.farWrist,
  ].filter((p) => p[1] >= 235);

  const shadowCenterX =
    groundContacts.length > 0
      ? groundContacts.reduce((acc, p) => acc + p[0], 0) / groundContacts.length
      : joints.pelvis[0];

  const shadowSpanX =
    groundContacts.length > 1
      ? Math.max(35, Math.min(100, Math.max(...groundContacts.map((p) => p[0])) - Math.min(...groundContacts.map((p) => p[0])) + 25))
      : 55;

  return (
    <div className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden ${className}`}>
      {partnerTag && (
        <span className="absolute top-2 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-cyan-400 border border-cyan-500/30 z-10">
          {partnerTag}
        </span>
      )}
      <svg
        viewBox={dynamicViewBox}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full object-contain filter drop-shadow-[0_8px_24px_rgba(34,197,94,0.22)]"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={mainColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>

        {/* Légère ombre au sol floutée */}
        {showFloor && (
          <ellipse
            cx={shadowCenterX}
            cy="251"
            rx={shadowSpanX / 2}
            ry="4.5"
            fill="#020617"
            opacity="0.5"
          />
        )}

        {/* Ligne de sol visible à y = 250 */}
        {showFloor && (
          <g>
            <line x1="-50" y1="250" x2="500" y2="250" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
            <line
              x1="20"
              y1="250"
              x2="380"
              y2="250"
              stroke={mainColor}
              strokeWidth="2"
              strokeDasharray="6 6"
              opacity="0.4"
            />
          </g>
        )}

        {/* Accessoire Mur dessiné (ne traverse jamais la tête) */}
        {poseDef.hasWall && (
          <g>
            <line x1="45" y1="40" x2="45" y2="250" stroke="#334155" strokeWidth="9" strokeLinecap="round" />
            <line x1="45" y1="50" x2="45" y2="245" stroke={secondaryColor} strokeWidth="3" opacity="0.8" />
          </g>
        )}

        {/* Accessoire Chaise dessiné */}
        {poseDef.hasChair && (
          <g>
            {/* Assise sous les mains / bassin à y = 200 */}
            <rect x="155" y="198" width="65" height="9" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="2.5" />
            {/* Pieds ancrés au sol */}
            <line x1="165" y1="207" x2="165" y2="250" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
            <line x1="210" y1="207" x2="210" y2="250" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
            {/* Dossier situé en retrait */}
            <line x1="158" y1="202" x2="158" y2="140" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {/* 1. MEMBRES ARRIÈRE (côté opposé plus sombre pour profondeur 3D, opacité 100%) */}
        {/* Jambe arrière : Cuisse (14px) > Mollet (10.5px) > Pied (8px) */}
        <g stroke={backLimbColor} strokeLinecap="round" opacity="1">
          <line
            x1={joints.farHip[0]}
            y1={joints.farHip[1]}
            x2={joints.farKnee[0]}
            y2={joints.farKnee[1]}
            strokeWidth="14"
          />
          <line
            x1={joints.farKnee[0]}
            y1={joints.farKnee[1]}
            x2={joints.farAnkle[0]}
            y2={joints.farAnkle[1]}
            strokeWidth="10.5"
          />
          <line
            x1={joints.farAnkle[0]}
            y1={joints.farAnkle[1]}
            x2={joints.farToe[0]}
            y2={joints.farToe[1]}
            strokeWidth="8"
          />
        </g>

        {/* Bras arrière : Bras (11.5px) > Avant-bras (8.5px) */}
        <g stroke={backLimbColor} strokeLinecap="round" opacity="1">
          <line
            x1={joints.farShoulder[0]}
            y1={joints.farShoulder[1]}
            x2={joints.farElbow[0]}
            y2={joints.farElbow[1]}
            strokeWidth="11.5"
          />
          <line
            x1={joints.farElbow[0]}
            y1={joints.farElbow[1]}
            x2={joints.farWrist[0]}
            y2={joints.farWrist[1]}
            strokeWidth="8.5"
          />
        </g>

        {/* 2. TORSE EN TRAPÈZE ARRONDI (Rattaché fermement au bassin et aux épaules) */}
        <g strokeLinecap="round" opacity="1">
          {/* Colonne & tronc principal de pelvis à chest : stroke solide 100% visible, quelle que soit la direction (même verticale) */}
          <line
            x1={joints.pelvis[0]}
            y1={joints.pelvis[1]}
            x2={joints.chest[0]}
            y2={joints.chest[1]}
            stroke={mainColor}
            strokeWidth="19"
          />
          {/* Épaules élargies */}
          <line
            x1={joints.chest[0] - 6}
            y1={joints.chest[1]}
            x2={joints.chest[0] + 6}
            y2={joints.chest[1]}
            stroke={mainColor}
            strokeWidth="16"
          />
        </g>

        {/* 3. COU ET TÊTE (Cou rattaché directement au haut du torse et au centre de la tête) */}
        <g opacity="1">
          {/* Cou : relie fermement joints.chest à joints.head */}
          <line
            x1={joints.chest[0]}
            y1={joints.chest[1]}
            x2={joints.head[0]}
            y2={joints.head[1]}
            stroke={mainColor}
            strokeWidth="7.5"
            strokeLinecap="round"
          />
          {/* Tête ovale : proportion canonique 1/7 de la taille du corps sur TOUS les exercices */}
          <ellipse
            cx={joints.head[0]}
            cy={joints.head[1]}
            rx="9.8"
            ry="13"
            fill={mainColor}
          />
        </g>

        {/* 4. MEMBRES DU PREMIER PLAN (Opacité 100%, sans aucun rond d'articulation isolé) */}
        {/* Jambe avant : Cuisse (16px) -> Genou -> Mollet (12px) -> Cheville -> Pied (9px) */}
        <g stroke={mainColor} strokeLinecap="round" opacity="1">
          <line
            x1={joints.nearHip[0]}
            y1={joints.nearHip[1]}
            x2={joints.nearKnee[0]}
            y2={joints.nearKnee[1]}
            strokeWidth="16"
          />
          <line
            x1={joints.nearKnee[0]}
            y1={joints.nearKnee[1]}
            x2={joints.nearAnkle[0]}
            y2={joints.nearAnkle[1]}
            strokeWidth="12"
          />
          <line
            x1={joints.nearAnkle[0]}
            y1={joints.nearAnkle[1]}
            x2={joints.nearToe[0]}
            y2={joints.nearToe[1]}
            strokeWidth="9"
          />
        </g>

        {/* Bras avant : Épaule -> Bras (13px) -> Coude -> Avant-bras (9.5px) */}
        <g stroke={mainColor} strokeLinecap="round" opacity="1">
          <line
            x1={joints.nearShoulder[0]}
            y1={joints.nearShoulder[1]}
            x2={joints.nearElbow[0]}
            y2={joints.nearElbow[1]}
            strokeWidth="13"
          />
          <line
            x1={joints.nearElbow[0]}
            y1={joints.nearElbow[1]}
            x2={joints.nearWrist[0]}
            y2={joints.nearWrist[1]}
            strokeWidth="9.5"
          />
        </g>
      </svg>
    </div>
  );
};
