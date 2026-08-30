export const D_PLAN_ROOMS = [
  { id: 'living_dining', name: '客餐厅', aliases: ['客餐厅', '客厅', 'living room', 'living'], x: -3, z: 0.58, width: 5, depth: 4.45, color: '#d8d3c8', lightObject: 'Light_LivingDining' },
  { id: 'balcony', name: '阳台', aliases: ['阳台', 'balcony'], x: -3, z: 3.55, width: 5, depth: 1.5, color: '#b9c4c3', lightObject: 'Light_Balcony' },
  { id: 'kitchen', name: '厨房', aliases: ['厨房', 'kitchen'], x: -1.88, z: -2.98, width: 2.55, depth: 2.65, color: '#b8b3a8', lightObject: 'Light_Kitchen' },
  { id: 'guest_bath', name: '公卫', aliases: ['公卫', '客卫', '次卫', 'guest bath'], x: 0.23, z: -2.98, width: 1.65, depth: 2.65, color: '#87949a', lightObject: 'Light_GuestBath' },
  { id: 'north_bedroom', name: '北卧室', aliases: ['北卧', '书房', 'bedroom 3', 'bedroom_3'], x: 2.38, z: -2.98, width: 2.65, depth: 2.65, color: '#a8845f', lightObject: 'Light_NorthBedroom' },
  { id: 'primary_bath', name: '主卫', aliases: ['主卫', 'primary bath', 'master bath'], x: 4.58, z: -2.93, width: 1.75, depth: 2.75, color: '#87949a', lightObject: 'Light_PrimaryBath' },
  { id: 'west_bedroom', name: '次卧', aliases: ['次卧', '儿童房', 'bedroom 2', 'bedroom_2'], x: 0.9, z: 0.08, width: 2.8, depth: 3.45, color: '#a8845f', lightObject: 'Light_WestBedroom' },
  { id: 'east_bedroom', name: '主卧', aliases: ['主卧', 'primary bedroom', 'master bedroom'], x: 3.9, z: 0.08, width: 3.2, depth: 3.45, color: '#a8845f', lightObject: 'Light_EastBedroom' },
];

// Three joined foundations preserve the two recesses visible in the supplied
// D-plan instead of filling the whole 11 x 8.6 m bounding rectangle.
export const D_PLAN_FOUNDATIONS = [
  { x: -3, z: 1.325, width: 5, depth: 5.95 },
  { x: 1.175, z: -2.975, width: 8.65, depth: 2.65 },
  { x: 2.5, z: 0.075, width: 6, depth: 3.45 },
];

// Lightweight furniture makes each zone recognisable while keeping the model
// fast enough for Home Assistant tablets and wall panels.
export const D_PLAN_FURNITURE = [
  { id: 'living_tv', roomId: 'living_dining', kind: 'cabinet', x: -5.16, z: 0.15, width: .22, depth: 1.55, height: .32, color: '#6d7470' },
  { id: 'living_sofa', roomId: 'living_dining', kind: 'sofa', x: -3.82, z: .42, width: 1.65, depth: .72, height: .38, color: '#a7b2ac' },
  { id: 'living_table', roomId: 'living_dining', kind: 'table', x: -3.58, z: -.52, width: .9, depth: .58, height: .3, color: '#715d49' },
  { id: 'dining_table', roomId: 'living_dining', kind: 'table', x: -1.45, z: .24, width: 1.18, depth: 1.45, height: .38, color: '#8c7358' },
  { id: 'kitchen_back', roomId: 'kitchen', kind: 'cabinet', x: -1.88, z: -4.02, width: 1.92, depth: .34, height: .48, color: '#d3cec2' },
  { id: 'kitchen_side', roomId: 'kitchen', kind: 'cabinet', x: -2.88, z: -3.18, width: .34, depth: 1.34, height: .48, color: '#d3cec2' },
  { id: 'guest_bath', roomId: 'guest_bath', kind: 'bath', x: .23, z: -3.15, width: .72, depth: 1.15, height: .28, color: '#dce3e2' },
  { id: 'north_bed', roomId: 'north_bedroom', kind: 'bed', x: 2.42, z: -3.12, width: 1.42, depth: 1.8, height: .32, color: '#a9c0bd' },
  { id: 'primary_bath', roomId: 'primary_bath', kind: 'bath', x: 4.58, z: -3.0, width: .78, depth: 1.28, height: .28, color: '#dce3e2' },
  { id: 'west_bed', roomId: 'west_bedroom', kind: 'bed', x: .9, z: .08, width: 1.48, depth: 1.9, height: .34, color: '#89abb4' },
  { id: 'east_bed', roomId: 'east_bedroom', kind: 'bed', x: 3.9, z: .08, width: 1.72, depth: 1.94, height: .34, color: '#89abb4' },
  { id: 'balcony_planter', roomId: 'balcony', kind: 'planter', x: -3, z: 4.0, width: 3.3, depth: .32, height: .28, color: '#71836d' },
];

// Wall segments follow the supplied D-plan drawing. Units are metres.
export const D_PLAN_WALLS = [
  [-5.5, -1.65, -3.15, -1.65], [-3.15, -1.65, -3.15, -4.3], [-3.15, -4.3, 5.5, -4.3],
  [5.5, -4.3, 5.5, 1.8], [5.5, 1.8, -0.5, 1.8], [-0.5, 1.8, -0.5, 2.8],
  [-0.5, 2.8, -5.5, 2.8], [-5.5, 2.8, -5.5, -1.65],
  [-5.5, 2.8, -5.5, 4.3], [-5.5, 4.3, -0.5, 4.3], [-0.5, 4.3, -0.5, 2.8],
  [-0.6, -4.3, -0.6, -1.65], [1.05, -4.3, 1.05, -1.65], [3.7, -4.3, 3.7, -1.65],
  [-3.15, -1.65, -0.5, -1.65], [0.4, -1.65, 1.9, -1.65], [2.8, -1.65, 5.5, -1.65],
  [-0.5, -1.65, -0.5, 1.8], [2.3, -1.65, 2.3, 1.8],
];

export function resolveDPlanConfig(config = {}) {
  return {
    layout: 'd99',
    camera: { position: [0, 16.5, 10.2], target: [0, 0, 0], ...(config.camera || {}) },
    ...config,
    rooms: config.rooms?.length ? config.rooms : D_PLAN_ROOMS.map(({ id, name, aliases, lightObject }) => ({ id, name, aliases, lightObject, objectNames: [`Room_${id}`] })),
    lights: config.lights || [],
  };
}

const makeLabel = (THREE, text) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgba(20, 24, 23, .72)';
  if (context.roundRect) {
    context.beginPath();
    context.roundRect(18, 16, 220, 62, 20);
    context.fill();
  } else {
    context.fillRect(18, 16, 220, 62);
  }
  context.fillStyle = '#f7f4ed';
  context.font = '600 34px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 128, 48);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(1.92, 0.72, 1);
  return sprite;
};

export function createProceduralDPlan(THREE) {
  const root = new THREE.Group();
  root.name = 'HomeOS_D99';

  const foundationMaterial = new THREE.MeshStandardMaterial({ color: '#4d514f', roughness: 0.92 });
  D_PLAN_FOUNDATIONS.forEach((section, index) => {
    const base = new THREE.Mesh(new THREE.BoxGeometry(section.width + .16, .16, section.depth + .16), foundationMaterial);
    base.name = `Foundation_${index + 1}`;
    base.position.set(section.x, -.1, section.z);
    base.receiveShadow = true;
    root.add(base);
  });

  D_PLAN_ROOMS.forEach((room) => {
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(room.width - 0.1, 0.1, room.depth - 0.1),
      new THREE.MeshStandardMaterial({ color: room.color, roughness: 0.78, metalness: 0.02 }),
    );
    floor.name = `Room_${room.id}`;
    floor.userData.roomId = room.id;
    floor.position.set(room.x, 0.02, room.z);
    floor.receiveShadow = true;
    root.add(floor);

    const light = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.035, 28),
      new THREE.MeshStandardMaterial({ color: '#efe3c7', emissive: '#24262b', emissiveIntensity: 0.08 }),
    );
    light.name = room.lightObject;
    light.userData.roomId = room.id;
    light.position.set(room.x, 0.13, room.z);
    root.add(light);

    const label = makeLabel(THREE, room.name);
    label.name = `Label_${room.id}`;
    label.userData.roomId = room.id;
    label.position.set(room.x, 0.72, room.z);
    root.add(label);

    const markerTypes = ['presence', 'climate', 'curtain', 'media'];
    markerTypes.forEach((type, markerIndex) => {
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 18, 14),
        new THREE.MeshStandardMaterial({ color: '#68706e', emissive: '#202523', emissiveIntensity: 0.15, roughness: 0.42 }),
      );
      marker.name = `Hotspot_${type}_${room.id}`;
      marker.userData.roomId = room.id;
      marker.userData.deviceType = type;
      marker.position.set(room.x - room.width * 0.26 + markerIndex * 0.26, 0.24, room.z + room.depth * 0.28);
      marker.visible = false;
      root.add(marker);
    });
  });

  D_PLAN_FURNITURE.forEach((item) => {
    const furniture = new THREE.Mesh(
      new THREE.BoxGeometry(item.width, item.height, item.depth),
      new THREE.MeshStandardMaterial({ color: item.color, roughness: .78 }),
    );
    furniture.name = `Furniture_${item.id}`;
    furniture.userData.roomId = item.roomId;
    furniture.position.set(item.x, item.height / 2 + .09, item.z);
    furniture.castShadow = true;
    furniture.receiveShadow = true;
    root.add(furniture);
  });

  const vacuum = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 0.11, 32),
    new THREE.MeshStandardMaterial({ color: '#68706e', emissive: '#202523', emissiveIntensity: 0.12, roughness: 0.36 }),
  );
  vacuum.name = 'Hotspot_vacuum';
  vacuum.userData.roomId = 'living_dining';
  vacuum.userData.deviceType = 'vacuum';
  vacuum.position.set(-1.35, 0.16, 1.55);
  vacuum.visible = false;
  root.add(vacuum);

  const wallMaterial = new THREE.MeshStandardMaterial({ color: '#ede9df', roughness: 0.88 });
  D_PLAN_WALLS.forEach(([x1, z1, x2, z2], index) => {
    const length = Math.hypot(x2 - x1, z2 - z1);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(length, 0.62, 0.12), wallMaterial);
    wall.name = `Wall_${index + 1}`;
    wall.position.set((x1 + x2) / 2, 0.31, (z1 + z2) / 2);
    wall.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
    wall.castShadow = true;
    wall.receiveShadow = true;
    root.add(wall);
  });

  return root;
}
