// Four independent blocking studies, not a production selection. Rotation is
// authored pitch/yaw/roll in degrees. No animal ID or runtime look target.
const pose = (s, position, pitch = 0, yaw = 0) => ({ s, position, rotation: [pitch, yaw, 0] });
export const directions = {
  A: { id: 'A', name: 'Documentary Observer', fov: 48, poses: [
    pose(0, [0, .1, 5.8], 0, -5), pose(.13, [0, .1, 5.8], 0, -5),
    pose(.30, [0, -.2, 1.6], 0, 0), pose(.41, [0, -.2, 1.6], 0, 0),
    pose(.62, [0, -1.3, -2.8], 0, -3), pose(.73, [0, -1.3, -2.8], 0, -3),
    pose(.94, [0, -3, -7.8], -7, 0), pose(1, [0, -3, -7.8], -7, 0),
  ] },
  B: { id: 'B', name: 'Neutrally Buoyant One-Take', fov: 53, poses: [
    pose(0, [-2.5, 1, 6.5], -2, -8), pose(.25, [-1.4, .6, 2.7], -2, -6),
    pose(.5, [.3, -.5, -.8], -2, -3), pose(.75, [1.3, -1.9, -4.4], -3, 1),
    pose(1, [.3, -3.6, -8.2], -9, 3),
  ] },
  C: { id: 'C', name: 'Intimate Wide-Angle Observer', fov: 64, poses: [
    pose(0, [1.6, .2, 3.5], 0, 1), pose(.17, [1.6, .2, 3.5], 0, 1),
    pose(.38, [-.6, -.9, -1.6], 3, -3), pose(.48, [-.6, -.9, -1.6], 3, -3),
    pose(.7, [1.2, -1.2, -5.3], 1, 4), pose(.8, [1.2, -1.2, -5.3], 1, 4),
    pose(1, [.5, -3, -10], -7, 0),
  ] },
  D: { id: 'D', name: 'Deep Pelagic Descent', fov: 50, poses: [
    pose(0, [-1, 5.2, 5], 2, -3), pose(.24, [-1, 4.4, 2.6], 2, -3),
    pose(.51, [-.5, 1.8, -.2], 1, -2), pose(.76, [0, -1, -3.1], 0, 0),
    pose(.87, [0, -1, -3.1], 0, 0), pose(1, [0, -4.2, -7], -12, 0),
  ] },
};
