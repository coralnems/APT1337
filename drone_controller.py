import math

class DroneController:
    def __init__(self):
        self.position = [0.0, 0.0, 0.0]  # x, y, z coordinates
        self.orientation = [0.0, 0.0, 0.0]  # roll, pitch, yaw
        self.speed = 0.0  # speed in m/s

    def set_position(self, x, y, z):
        self.position = [x, y, z]
        print(f"Position set to: {self.position}")

    def set_orientation(self, roll, pitch, yaw):
        self.orientation = [roll, pitch, yaw]
        print(f"Orientation set to: {self.orientation}")

    def set_speed(self, speed):
        if speed < 0:
            print("Speed cannot be negative.")
        else:
            self.speed = speed
            print(f"Speed set to: {self.speed} m/s")

    def move(self, dx, dy, dz):
        self.position[0] += dx
        self.position[1] += dy
        self.position[2] += dz
        print(f"Moved to new position: {self.position}")

    def rotate(self, droll, dpitch, dyaw):
        self.orientation[0] += droll
        self.orientation[1] += dpitch
        self.orientation[2] += dyaw
        print(f"Rotated to new orientation: {self.orientation}")

    def get_distance(self, target_position):
        distance = math.sqrt(
            (self.position[0] - target_position[0]) ** 2 +
            (self.position[1] - target_position[1]) ** 2 +
            (self.position[2] - target_position[2]) ** 2
        )
        print(f"Distance to target: {distance} meters")
        return distance

    def hover(self, duration):
        print(f"Hovering in place for {duration} seconds.")

# Example usage
if __name__ == "__main__":
    drone = DroneController()
    drone.set_position(0, 0, 10)
    drone.set_orientation(0, 0, 90)
    drone.set_speed(5)
    drone.move(10, 0, 0)
    drone.rotate(0, 0, -45)
    drone.get_distance([20, 0, 10])
    drone.hover(5)