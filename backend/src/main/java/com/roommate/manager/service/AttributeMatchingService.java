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
        // Location weight increased to 0.20 since proximity within same city is now important
        return (ageScore * 0.20) +
               (genderScore * 0.25) +
               (lifestyleScore * 0.25) +
               (budgetScore * 0.10) +
               (locationScore * 0.20);
    }

    /**
     * Check if two users meet hard requirements (must pass all filters)
     * Hard requirements: Gender + Same City (location)
     */
    public boolean meetsHardRequirements(UserModel userA, UserModel userB) {
        boolean passesGender = passesGenderRequirement(userA, userB);
        boolean passesLocation = passesCityRequirement(userA, userB);

        System.out.println("    Checking " + userA.getFirstName() + "'s requirements for " + userB.getFirstName() + ":");
        System.out.println("      Gender: " + (passesGender ? "✓" : "✗"));
        System.out.println("      Location (Same City): " + (passesLocation ? "✓" : "✗"));

        if (!passesGender) {
            System.out.println("      ❌ Failed Gender: " + userA.getFirstName() + " wants " +
                (userA.getPreferences() != null && userA.getPreferences().getGender() != null ? userA.getPreferences().getGender() : "any") +
                ", " + userB.getFirstName() + " is " + (userB.getGender() != null ? userB.getGender() : "unknown"));
        }

        if (!passesLocation) {
            System.out.println("      ❌ Failed Location: " + userA.getFirstName() + " is in city " +
                getCityCode(userA.getZipCode()) + ", " + userB.getFirstName() + " is in city " + getCityCode(userB.getZipCode()));
        }

        return passesGender && passesLocation;
    }

    /**
     * Check if two users are in the same city (based on first 3 digits of zipcode)
     */
    private boolean passesCityRequirement(UserModel userA, UserModel userB) {
        if (userA.getZipCode() == null || userB.getZipCode() == null) {
            return false; // Require both users to have zipcode set
        }

        String cityA = getCityCode(userA.getZipCode());
        String cityB = getCityCode(userB.getZipCode());

        return cityA != null && cityB != null && cityA.equals(cityB);
    }

    /**
     * Extract city code from zipcode (first 3 digits)
     * In US zipcodes, the first 3 digits represent the sectional center facility (roughly a city/metro area)
     */
    private String getCityCode(String zipCode) {
        if (zipCode == null || zipCode.length() < 3) {
            return null;
        }
        return zipCode.substring(0, 3);
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
        if (userA.getPreferences() == null) return 1.0;

        int ageBInYears = calculateAge(userB.getDateOfBirth());
        Integer minAge = userA.getPreferences().getMinAge();
        Integer maxAge = userA.getPreferences().getMaxAge();

        if (minAge == null || maxAge == null) return 1.0;

        // Calculate the midpoint of preferred age range
        int midPoint = (minAge + maxAge) / 2;
        int range = maxAge - minAge;

        // If age is within preferred range, score based on how centered it is
        if (ageBInYears >= minAge && ageBInYears <= maxAge) {
            if (range == 0) return 1.0;
            int distance = Math.abs(ageBInYears - midPoint);
            // Score from 1.0 at center to 0.7 at edges
            return Math.max(0.7, 1.0 - (double) distance / (range / 2.0) * 0.3);
        }

        // If age is outside preferred range, score decreases with distance
        int distanceFromRange;
        if (ageBInYears < minAge) {
            distanceFromRange = minAge - ageBInYears;
        } else {
            distanceFromRange = ageBInYears - maxAge;
        }

        // Decay score: starts at 0.6 just outside range, decreases gradually
        // Every 5 years outside range reduces score by ~0.15
        // Minimum score is 0.1 (never completely zero)
        double penalty = distanceFromRange * 0.03;
        return Math.max(0.1, 0.6 - penalty);
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

        // Smoking match - partial credit for mismatches
        Boolean prefSmoking = userA.getPreferences().getSmoking();
        Boolean actualSmoking = userB.getLifestyle().getSmoking();
        if (prefSmoking != null && actualSmoking != null) {
            if (prefSmoking.equals(actualSmoking)) {
                score += 1.0; // Perfect match
            } else {
                score += 0.3; // Mismatch but not complete failure
            }
            factors++;
        }

        // Pet match - partial credit for mismatches
        Boolean prefPets = userA.getPreferences().getPetFriendly();
        Boolean actualPets = userB.getLifestyle().getPetFriendly();
        if (prefPets != null && actualPets != null) {
            if (prefPets.equals(actualPets)) {
                score += 1.0; // Perfect match
            } else {
                score += 0.3; // Mismatch but not complete failure
            }
            factors++;
        }

        // Night owl match - partial credit (slightly more forgiving for schedule flexibility)
        Boolean prefNightOwl = userA.getPreferences().getNightOwl();
        Boolean actualNightOwl = userB.getLifestyle().getNightOwl();
        if (prefNightOwl != null && actualNightOwl != null) {
            if (prefNightOwl.equals(actualNightOwl)) {
                score += 1.0; // Perfect match
            } else {
                score += 0.4; // Mismatch but people can adapt schedules
            }
            factors++;
        }

        // Guest frequency match (uses existing gradual scoring)
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

    /**
     * Calculate location match score with proximity-based scoring
     *
     * Scoring strategy:
     * - Same exact zipcode: 1.0 (perfect match)
     * - Same city, close zipcodes: 0.7-0.95 (higher score for closer proximity)
     * - Different city: 0.1 (filtered out by hard requirements, but very low score if reached)
     *
     * Within same city, proximity is based on the numeric difference in zipcodes.
     * Smaller difference = higher score (closer neighborhoods)
     */
    private double calculateLocationMatch(UserModel userA, UserModel userB) {
        if (userA.getZipCode() == null || userB.getZipCode() == null) {
            return 0.1; // Very low score if location not specified
        }

        String zipA = userA.getZipCode();
        String zipB = userB.getZipCode();

        // Exact zip code match - same neighborhood
        if (zipA.equals(zipB)) {
            return 1.0;
        }

        // Check if same city (first 3 digits)
        String cityA = getCityCode(zipA);
        String cityB = getCityCode(zipB);

        if (cityA == null || cityB == null || !cityA.equals(cityB)) {
            // Different cities - should be filtered by hard requirements
            // But if this is reached, give very low score
            return 0.1;
        }

        // Same city, different zipcode - score based on proximity
        // Extract numeric values from zipcodes for distance calculation
        try {
            int zipNumA = Integer.parseInt(zipA.replaceAll("[^0-9]", ""));
            int zipNumB = Integer.parseInt(zipB.replaceAll("[^0-9]", ""));

            int distance = Math.abs(zipNumA - zipNumB);

            // Proximity scoring within same city:
            // - Distance 0-10: Score 0.90-1.00 (very close, adjacent neighborhoods)
            // - Distance 11-50: Score 0.75-0.89 (nearby areas)
            // - Distance 51-100: Score 0.60-0.74 (same city, farther apart)
            // - Distance 100+: Score 0.50-0.59 (same city, opposite ends)

            double score;
            if (distance <= 10) {
                // Very close zipcodes - linear scale from 0.90 to 1.0
                score = 1.0 - (distance * 0.01);
            } else if (distance <= 50) {
                // Nearby - score from 0.75 to 0.89
                score = 0.89 - ((distance - 10) * 0.0035);
            } else if (distance <= 100) {
                // Same city, farther - score from 0.60 to 0.74
                score = 0.74 - ((distance - 50) * 0.0028);
            } else {
                // Same city, far apart - score from 0.50 to 0.59
                // Cap at distance 200 for score calculation
                int cappedDistance = Math.min(distance, 200);
                score = 0.59 - ((cappedDistance - 100) * 0.0009);
            }

            // Ensure minimum score of 0.50 for same city
            return Math.max(0.50, score);

        } catch (NumberFormatException e) {
            // If zipcode parsing fails, give neutral same-city score
            return 0.70;
        }
    }
}
