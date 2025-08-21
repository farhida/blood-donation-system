"""Re-export views used by the frontend.

Do not modify logic here; these are thin aliases so routing and imports can
point to `core` while the original implementation remains in `accounts` and
`donors` until we're ready to remove them.
"""

# Account-related views
from accounts.views import (
    RegisterView,
    MyProfileView,
    AdminUserListView,
    AdminUserDetailView,
)

# Donor-related views
from donors.views import (
    LoginView,
    PublicDonorSearch,
    BloodInventoryList,
    AnalyticsView,
    DashboardSummaryView,
)

# Expose a flat namespace for imports
__all__ = [
    'RegisterView', 'MyProfileView', 'AdminUserListView', 'AdminUserDetailView',
    'LoginView', 'PublicDonorSearch', 'BloodInventoryList', 'AnalyticsView', 'DashboardSummaryView',
]
