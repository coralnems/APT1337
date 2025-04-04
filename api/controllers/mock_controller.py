class MockController:
    def __init__(self):
        self.data = {}

    def get_data(self, key):
        """Retrieve data by key."""
        return self.data.get(key, None)

    def set_data(self, key, value):
        """Set data for a specific key."""
        self.data[key] = value

    def delete_data(self, key):
        """Delete data by key."""
        if key in self.data:
            del self.data[key]
            return True
        return False