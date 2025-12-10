package com.roommate.manager.service;

import com.roommate.manager.model.UserModel;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;

/**
 * Service for rule-based attribute matching
 * Calculates compatibility scores based on hard requirements and preferences
 */
@Service
public class AttributeMatchingService {

    /**
     * Calculate compatibility score between two users based on attributes
     * Returns a score between 0.0 and 1.0
     *
     * @param userA The user whose preferences we're checking
     * @param userB The candidate being evaluated
     * @return Compatibility score (0.0 to 1.0)
     */
    public double calculateCompatibilityScore(UserModel userA, UserModel userB) {
        double ageScore = calculateAgeMatch(userA, userB);
        double genderScore = calculateGenderMatch(userA, userB);
        double lifestyleScore = calculateLifestyleMatch(userA, userB);
        double budgetScore = calculateBudgetOverlap(userA, userB);
        double locationScore = calculateLocationMatch(userA, userB);

        // Weighted combination
        return (ageScore * 0.25) +
               (genderScore * 0.25) +
               (lifestyleScore * 0.30) +
               (budgetScore * 0.10) +
               (locationScore * 0.10);
    }

    /**
     * Check if two users meet hard requirements (must pass all filters)
     */
    public boolean meetsHardRequirements(UserModel userA, UserModel userB) {
        boolean passesAge = passesAgeRequirement(userA, userB);
        boolean passesGender = passesGenderRequirement(userA, userB);
        boolean passesLifestyle = passesLifestyleRequirements(userA, userB);

        System.out.println("    Checking " + userA.getFirstName() + "'s requirements for " + userB.getFirstName() + ":");
        System.out.println("      Age: " + (passesAge ? "✓" : "✗"));
        System.out.println("      Gender: " + (passesGender ? "✓" : "✗"));
        System.out.println("      Lifestyle: " + (passesLifestyle ? "✓" : "✗"));

        if (!passesAge) {
            System.out.println("      ❌ Failed Age: " + userA.getFirstName() + " wants " +
                (userA.getPreferences() != null ? userA.getPreferences().getMinAge() + "-" + userA.getPreferences().getMaxAge() : "any") +
                ", " + userB.getFirstName() + " is " + calculateAge(userB.getDateOfBirth()));
        }

        if (!passesGender) {
            System.out.println("      ❌ Failed Gender: " + userA.getFirstName() + " wants " +
                (userA.getPreferences() != null && userA.getPreferences().getGender() != null ? userA.getPreferences().getGender() : "any") +
                ", " + userB.getFirstName() + " is " + (userB.getGender() != null ? userB.getGender() : "unknown"));
        }

        if (!passesLifestyle) {
            System.out.println("      ❌ Failed Lifestyle requirements");
        }

        return passesAge && passesGender && passesLifestyle;
    }

    /**
     * Calculate bidirectional mutual score
     */
    public double calculateMutualScore(UserModel userA, UserModel userB) {
        double aWantsB = calculateCompatibilityScore(userA, userB);
        double bWantsA = calculateCompatibilityScore(userB, userA);
        return (aWantsB + bWantsA) / 2.0;
    }

    // ========== AGE MATCHING ==========

    private boolean passesAgeRequirement(UserModel userA, UserModel userB) {
        if (userA.getPreferences() == null) return true;

        int ageBInYears = calculateAge(userB.getDateOfBirth());
        Integer minAge = userA.getPreferences().getMinAge();
        Integer maxAge = userA.getPreferences().getMaxAge();

        if (minAge != null && ageBInYears < minAge) return false;
        if (maxAge != null && ageBInYears > maxAge) return false;

        return true;
    }

    private double calculateAgeMatch(UserModel userA, UserModel userB) {
        if (!passesAgeRequirement(userA, userB)) return 0.0;

        if (userA.getPreferences() == null) return 1.0;

        int ageBInYears = calculateAge(userB.getDateOfBirth());
        Integer minAge = userA.getPreferences().getMinAge();
        Integer maxAge = userA.getPreferences().getMaxAge();

        if (minAge == null || maxAge == null) return 1.0;

        // Calculate how centered the age is within the preferred range
        int range = maxAge - minAge;
        if (range == 0) return 1.0;

        int midPoint = (minAge + maxAge) / 2;
        int distance = Math.abs(ageBInYears - midPoint);

        // Score decreases as we move away from center
        return Math.max(0.0, 1.0 - (double) distance / (range / 2.0));
    }

    private int calculateAge(Object dateOfBirth) {
        if (dateOfBirth == null) return 0;

        try {
            LocalDate birthDate;
            if (dateOfBirth instanceof java.util.Date) {
                birthDate = ((java.util.Date) dateOfBirth).toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();
            } else if (dateOfBirth instanceof LocalDate) {
                birthDate = (LocalDate) dateOfBirth;
            } else {
                return 0;
            }

            return Period.between(birthDate, LocalDate.now()).getYears();
        } catch (Exception e) {
            return 0;
        }
    }

    // ========== GENDER MATCHING ==========

    private boolean passesGenderRequirement(UserModel userA, UserModel userB) {
        if (userA.getPreferences() == null || userA.getPreferences().getGender() == null) {
            return true;
        }

        String preferredGender = userA.getPreferences().getGender().toLowerCase();

        if (preferredGender.equals("no preference") || preferredGender.equals("any")) {
            return true;
        }

        if (userB.getGender() == null) return false;

        return userB.getGender().toLowerCase().equals(preferredGender);
    }

    private double calculateGenderMatch(UserModel userA, UserModel userB) {
        return passesGenderRequirement(userA, userB) ? 1.0 : 0.0;
    }

    // ========== LIFESTYLE MATCHING ==========

    private boolean passesLifestyleRequirements(UserModel userA, UserModel userB) {
        if (userA.getPreferences() == null || userB.getLifestyle() == null) {
            return true;
        }

        // Smoking requirement
        Boolean prefersNonSmoking = userA.getPreferences().getSmoking();
        if (prefersNonSmoking != null && !prefersNonSmoking) {
            // User A prefers non-smoking
            Boolean bSmoking = userB.getLifestyle().getSmoking();
            if (bSmoking != null && bSmoking) {
                return false; // B smokes, but A doesn't want smoking
            }
        }

        // Pet requirement
        Boolean prefersPets = userA.getPreferences().getPetFriendly();
        if (prefersPets != null && !prefersPets) {
            // User A prefers no pets
            Boolean bPets = userB.getLifestyle().getPetFriendly();
            if (bPets != null && bPets) {
                return false; // B has pets, but A doesn't want pets
            }
        }

        return true;
    }

    private double calculateLifestyleMatch(UserModel userA, UserModel userB) {
        if (userA.getPreferences() == null || userB.getLifestyle() == null) {
            return 0.5; // Neutral score if data missing
        }

        double score = 0.0;
        int factors = 0;

        // Smoking match
        Boolean prefSmoking = userA.getPreferences().getSmoking();
        Boolean actualSmoking = userB.getLifestyle().getSmoking();
        if (prefSmoking != null && actualSmoking != null) {
            score += prefSmoking.equals(actualSmoking) ? 1.0 : 0.0;
            factors++;
        }

        // Pet match
        Boolean prefPets = userA.getPreferences().getPetFriendly();
        Boolean actualPets = userB.getLifestyle().getPetFriendly();
        if (prefPets != null && actualPets != null) {
            score += prefPets.equals(actualPets) ? 1.0 : 0.0;
            factors++;
        }

        // Night owl match
        Boolean prefNightOwl = userA.getPreferences().getNightOwl();
        Boolean actualNightOwl = userB.getLifestyle().getNightOwl();
        if (prefNightOwl != null && actualNightOwl != null) {
            score += prefNightOwl.equals(actualNightOwl) ? 1.0 : 0.0;
            factors++;
        }

        // Guest frequency match (simple string comparison for now)
        String prefGuests = userA.getPreferences().getGuestFrequency();
        String actualGuests = userB.getLifestyle().getGuestFrequency();
        if (prefGuests != null && actualGuests != null) {
            score += calculateGuestFrequencyMatch(prefGuests, actualGuests);
            factors++;
        }

        return factors > 0 ? score / factors : 0.5;
    }

    private double calculateGuestFrequencyMatch(String preferred, String actual) {
        // Exact match
        if (preferred.equalsIgnoreCase(actual)) return 1.0;

        String prefLower = preferred.toLowerCase();
        String actualLower = actual.toLowerCase();

        // If preference is for quiet/rarely guests
        if (prefLower.contains("quiet") || prefLower.contains("rarely")) {
            if (actualLower.contains("rarely") || actualLower.contains("keep to myself")) {
                return 1.0;
            }
            if (actualLower.contains("occasionally")) {
                return 0.7;
            }
            if (actualLower.contains("frequently") || actualLower.contains("gatherings")) {
                return 0.0;
            }
        }

        // If preference is for social/frequent guests
        if (prefLower.contains("social") || prefLower.contains("gatherings")) {
            if (actualLower.contains("frequently") || actualLower.contains("gatherings")) {
                return 1.0;
            }
            if (actualLower.contains("occasionally")) {
                return 0.7;
            }
            if (actualLower.contains("rarely") || actualLower.contains("quiet")) {
                return 0.0;
            }
        }

        // If preference is flexible
        if (prefLower.contains("don't mind") || prefLower.contains("flexible")) {
            return 0.8; // Generally compatible
        }

        return 0.5; // Neutral if can't determine
    }

    // ========== BUDGET MATCHING ==========

    private double calculateBudgetOverlap(UserModel userA, UserModel userB) {
        if (userA.getBudget() == null || userB.getBudget() == null) {
            return 0.5; // Neutral if budget not specified
        }

        int aMin = userA.getBudget().getMin();
        int aMax = userA.getBudget().getMax();
        int bMin = userB.getBudget().getMin();
        int bMax = userB.getBudget().getMax();

        // Calculate overlap
        int overlapMin = Math.max(aMin, bMin);
        int overlapMax = Math.min(aMax, bMax);

        if (overlapMax < overlapMin) {
            return 0.0; // No overlap
        }

        int overlapRange = overlapMax - overlapMin;
        int totalRange = Math.max(aMax - aMin, bMax - bMin);

        return totalRange > 0 ? (double) overlapRange / totalRange : 0.0;
    }

    // ========== LOCATION MATCHING ==========

    private double calculateLocationMatch(UserModel userA, UserModel userB) {
        if (userA.getZipCode() == null || userB.getZipCode() == null) {
            return 0.5; // Neutral if location not specified
        }

        // Exact zip code match
        if (userA.getZipCode().equals(userB.getZipCode())) {
            return 1.0;
        }

        // Could extend this to calculate distance between zip codes
        // For now, different zip = lower score
        return 0.3;
    }
}
