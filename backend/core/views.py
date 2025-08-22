"""Re-export views used by the frontend.

Do not modify logic here; these are thin aliases so routing and imports can
point to `core` while the original implementation remains in `accounts` and
`donors` until we're ready to remove them.
"""

# Account-related views now provided by api.accounts
from api.accounts import (
    RegisterView,
    MyProfileView,
    AdminUserListView,
    AdminUserDetailView,
)

# Donor-related views now provided by api.donors (canonical API location)
from api.donors import (
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
